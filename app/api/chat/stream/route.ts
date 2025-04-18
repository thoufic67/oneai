import { NextRequest } from "next/server";
import {
  OpenRouterService,
  Message,
  UsageData,
} from "@/lib/services/openrouter";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const openRouterService = new OpenRouterService();

export const runtime = "edge";

interface StreamResponse {
  content?: string;
  conversationId?: string;
  usage?: Partial<UsageData>;
  error?: string;
  done?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get session to verify authentication
    // const {
    //   data: { session },
    // } = await supabase.auth.getSession();
    // if (!session) {
    //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
    //     status: 401,
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // }

    const body = await req.json();
    const { messages, model, web, conversationId } = body;

    // Validate request
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Messages array is required and cannot be empty",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const isValidMessage = (msg: any): msg is Message => {
      return (
        msg &&
        typeof msg === "object" &&
        ["user", "assistant", "system"].includes(msg.role) &&
        typeof msg.content === "string" &&
        msg.content.trim().length > 0
      );
    };

    if (!messages.every(isValidMessage)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid message format. Each message must have a valid role and non-empty content",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Create response stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Helper function to send SSE data
    const sendSSE = async (data: StreamResponse) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Start streaming response
    let fullResponse = "";
    let responseUsage: Partial<UsageData> | undefined;

    // Process the chat completion with streaming
    openRouterService
      .createChatCompletion(
        { messages, model, stream: true, web },
        (chunk: string, usage?: Partial<UsageData>) => {
          fullResponse += chunk;

          if (usage) {
            responseUsage = usage;
          }

          sendSSE({
            content: chunk,
            conversationId,
            usage: responseUsage,
          });
        }
      )
      .then(async (response) => {
        // Get final usage data if available
        if (response.usage && !responseUsage) {
          responseUsage = response.usage;
        }

        // Save messages to database if we have a conversation ID
        if (conversationId) {
          try {
            // Save the conversation and messages to Supabase
            const { data: conversation, error: convError } = await supabase
              .from("conversations")
              .select()
              .eq("id", conversationId)
              .single();

            if (!convError && conversation) {
              // Save user message
              const userMessage = messages.find(
                (msg: Message) => msg.role === "user"
              );
              if (userMessage) {
                await supabase.from("chat_messages").insert({
                  conversation_id: conversationId,
                  role: "user",
                  content: userMessage.content,
                  tokens_used: responseUsage?.prompt_tokens || 0,
                });
              }

              // Save assistant response
              await supabase.from("chat_messages").insert({
                conversation_id: conversationId,
                role: "assistant",
                content: fullResponse,
                tokens_used: responseUsage?.completion_tokens || 0,
              });
            }
          } catch (error) {
            console.error("Error saving messages:", error);
          }
        }

        // Send final message
        await sendSSE({
          done: true,
          conversationId,
          usage: responseUsage,
        });

        await writer.close();
      })
      .catch(async (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        await sendSSE({
          error: errorMessage,
          conversationId,
        });
        await writer.close();
      });

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
