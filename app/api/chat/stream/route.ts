import { NextRequest } from "next/server";
import {
  OpenRouterService,
  Message as OpenRouterMessage,
} from "@/lib/services/openrouter";
import { UsageData } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { QuotaManager } from "@/lib/quota";
import { QuotaExceededError } from "@/config/quota";
import { OpenAIImageService } from "@/lib/services/openaiImage";
import { MidjourneyImageService } from "@/lib/services/midjourneyImage";
import { ImageGenerationParams } from "@/types";
import {
  validateRequest,
  checkQuota,
  createConversationIfNeeded,
  saveMessage,
  incrementQuota,
} from "@/lib/aiWorkflow";
import type { Message, StreamResponse } from "@/types";

const openRouterService = new OpenRouterService();

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const quotaManager = new QuotaManager(supabase);

    // Get session to verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const body = await req.json();
    let { messages, model, web, conversationId, image, previous_response_id } =
      body;

    // Extract attachments from the last user message
    const userMessages = messages.filter((msg: any) => msg.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1] || {};
    const attachments = lastUserMessage.attachments || [];

    // Validate attachments array if present
    if (
      attachments &&
      (!Array.isArray(attachments) ||
        attachments.some(
          (att) =>
            !att.attachment_type ||
            !att.attachment_url ||
            typeof att.attachment_type !== "string" ||
            typeof att.attachment_url !== "string"
        ))
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid attachments format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // --- IMAGE GENERATION LOGIC ---
    if (image) {
      console.log("IMAGE GENERATION LOGIC");
      // Create response stream for image generation
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();
      let keepAliveInterval: NodeJS.Timeout | undefined;
      let streamClosed = false;
      // Helper function to send SSE data
      const sendSSE = async (data: StreamResponse) => {
        try {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (err) {
          // Client likely disconnected; ignore, but continue processing
          console.log(
            "Client disconnected during SSE write (image generation):",
            err
          );
        }
      };
      // Start keep-alive interval
      keepAliveInterval = setInterval(() => {
        if (!streamClosed) {
          sendSSE({ keepAlive: true });
        }
      }, 5000); // every 5 seconds
      (async () => {
        try {
          // 1. Validate request
          validateRequest("image", body);
          // 2. Check quota
          await checkQuota(session.user.id, "image");
          // 3. Generate image prompt using OpenRouterService (gpt-4o-mini)
          const userMessages = messages.filter(
            (msg: any) => msg.role === "user"
          );
          const imagePromptSystemPrompt = `You are an expert prompt engineer. Given the following conversation, \n          generate a single, concise, and detailed prompt for an AI image generator. \n          Focus on the user's intent, giving more weight to the last two user messages. \n          Only output the prompt, nothing else.\n          The user's intent is: ${userMessages[userMessages.length - 1].content}\n          The conversation is: ${messages.map((msg: any) => msg.content).join("\n")}\n          \n          Don't try to be too creative, just generate a prompt that is clear and concise based on user's intent.\n          `;
          const promptMessages = [
            { role: "system", content: imagePromptSystemPrompt },
            ...messages,
          ];
          // const promptResponse = await openRouterService.createChatCompletion({
          //   messages: promptMessages,
          //   model: "openai/gpt-4.1-nano",
          //   stream: false,
          // });
          // const generatedPrompt = promptResponse.content.trim();
          // console.log("Generated prompt:", generatedPrompt);
          conversationId = await createConversationIfNeeded(
            conversationId,
            lastUserMessage.content || ""
            // generatedPrompt
          );
          const sequence_number = messages.length + 1;
          const userMsgSeq = sequence_number - 1;
          const [providerKey, modelName] = model.split("/");
          await saveMessage(
            conversationId,
            userMessages[userMessages.length - 1].content,
            "user",
            0,
            model,
            userMsgSeq,
            {},
            attachments
          );
          const imageProviders: Record<string, any> = {
            openai: new OpenAIImageService(),
            midjourney: new MidjourneyImageService(),
          };
          const imageProvider = imageProviders[providerKey];
          if (!imageProvider) {
            await sendSSE({
              error: `Unknown image provider for model: ${model}`,
            });
            return;
          }
          const params: ImageGenerationParams = {
            prompt: lastUserMessage.content,
            ...body, // allow n, size, user, etc. to be passed
            model: modelName,
            conversationId: conversationId,
            attachments: attachments,
            previous_response_id,
          };
          // --- Send keep-alive while waiting for image ---
          const result = await imageProvider.generateImage(params);
          // 6. Save AI response (sequence 2)
          await saveMessage(
            conversationId,
            JSON.stringify(result.choices[0].message.content),
            "assistant",
            result.usage?.response_tokens || 0,
            model,
            sequence_number,
            {
              // image_prompt: generatedPrompt,
              response_id: result.response_id,
            }
            // attachments
          );
          // 7. Increment quota
          await incrementQuota(session.user.id, "image");
          // Send final result
          await sendSSE({ ...result, conversationId, done: true });
        } catch (error: any) {
          await sendSSE({
            error: error.message || "Image generation failed",
            done: true,
          });
        } finally {
          if (keepAliveInterval) clearInterval(keepAliveInterval);
          streamClosed = true;
          try {
            await writer.close();
          } catch (err) {}
        }
      })();
      return new Response(stream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }
    // --- END IMAGE GENERATION LOGIC ---

    // --- CHAT LOGIC ---
    try {
      console.log("CHAT LOGIC");
      // 1. Validate request
      validateRequest("chat", body);
      // 2. Check quota
      await checkQuota(session.user.id, "chat");
      // 3. Create conversation if needed
      const userMessage = messages.find((msg: any) => msg.role === "user");
      conversationId = await createConversationIfNeeded(
        conversationId,
        userMessage?.content || ""
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: error.message || "Invalid chat request" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // --- END CHAT LOGIC ---

    // Create response stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Helper function to send SSE data, but don't let it interrupt processing
    const sendSSE = async (data: StreamResponse) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch (err) {
        // Client likely disconnected; ignore, but continue processing
        // Intentionally preserving logs for debugging and auditing
        console.log("Client disconnected during SSE write:", err);
      }
    };

    // Start streaming response
    let fullResponse = "";
    let responseUsage: Partial<UsageData> | undefined;
    let messageSavingFailed = false;
    let quotaIncrementFailed = false;
    // Base sequence number for new messages
    let sequence_number = messages.length + 1;

    // Process the chat completion with streaming
    openRouterService
      .createChatCompletion(
        attachments && attachments.length > 0
          ? { messages, model, stream: true, web, attachments }
          : { messages, model, stream: true, web },
        (chunk: string, usage?: Partial<UsageData>) => {
          fullResponse += chunk;

          if (usage) {
            responseUsage = usage;
          }

          // Try to send, but ignore errors
          sendSSE({
            content: chunk,
            conversationId,
            usage: responseUsage,
            failures: {
              ...(quotaIncrementFailed ? { quotaExceeded: true } : {}),
            },
          });
        }
      )
      .then(async (response) => {
        console.log("Complete response from OpenRouter", response);
        // Get final usage data if available
        if (response.usage && !responseUsage) {
          responseUsage = response.usage;
        }

        if (conversationId) {
          // Save user message - get the last user message
          const userMessage = [...messages]
            .reverse()
            .find((msg: Message) => msg.role === "user");

          if (userMessage) {
            const userMessageSaved = await saveMessage(
              conversationId,
              userMessage.content,
              "user",
              responseUsage?.prompt_tokens || 0,
              model,
              sequence_number - 1,
              {},
              attachments
            );

            if (!userMessageSaved) {
              messageSavingFailed = true;
            }
          }

          // Save assistant response
          const assistantMessageSaved = await saveMessage(
            conversationId,
            fullResponse,
            "assistant",
            responseUsage?.completion_tokens || 0,
            model,
            sequence_number,
            {}
            // attachments
          );

          if (!assistantMessageSaved) {
            messageSavingFailed = true;
          }
        }

        // Increment quota after successful message processing
        try {
          await quotaManager.incrementQuota(
            session.user.id,
            "small_messages",
            1
          );
        } catch (error) {
          console.error("Failed to increment quota:", error);
          quotaIncrementFailed = true;
        }

        // Try to send final SSE, but ignore errors
        await sendSSE({
          content: "",
          conversationId,
          usage: responseUsage,
          done: true,
          failures: {
            ...(messageSavingFailed ? { messageSaving: true } : {}),
            ...(quotaIncrementFailed ? { quotaExceeded: true } : {}),
          },
        });

        try {
          await writer.close();
        } catch (err) {
          // Ignore if already closed
          console.log("Writer already closed", err);
        }

        // Intentionally preserving logs for debugging and auditing
        if (messageSavingFailed) {
          console.error(
            "Message saving failed for conversation:",
            conversationId
          );
        }
        if (quotaIncrementFailed) {
          console.error("Quota increment failed for user:", session.user.id);
        }
      })
      .catch(async (error) => {
        // Intentionally preserving logs for debugging and auditing
        console.error("Error in chat completion:", error);
        await sendSSE({
          error: error.message || "An error occurred during chat completion",
          done: true,
        });
        try {
          await writer.close();
        } catch (err) {}
      });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("Error in stream route:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
