import { NextRequest } from "next/server";
import {
  OpenRouterService,
  Message as OpenRouterMessage,
  UsageData,
} from "@/lib/services/openrouter";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { QuotaManager } from "@/lib/quota";
import { QuotaExceededError } from "@/config/quota";

interface Message extends OpenRouterMessage {
  sequence_number?: number;
}

const openRouterService = new OpenRouterService();

export const runtime = "edge";

interface StreamResponse {
  content?: string;
  conversationId?: string;
  usage?: Partial<UsageData>;
  error?: string;
  done?: boolean;
  failures?: {
    conversationCreation?: boolean;
    messageSaving?: boolean;
    quotaExceeded?: boolean;
  };
}

async function createConversation(title: string) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieStore.toString(),
        },
        body: JSON.stringify({ title }),
      }
    );
    console.log(
      "Creating conversation response",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.conversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
}

async function saveMessage(
  conversationId: string,
  content: string,
  role: string,
  tokensUsed: number,
  model_id: string,
  sequence_number: number
) {
  try {
    const cookieStore = await cookies();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: cookieStore.toString(),
        },
        body: JSON.stringify({
          content,
          role,
          metadata: { tokens_used: tokensUsed },
          model_id,
          sequence_number,
        }),
      }
    );

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error saving message:", error);
    return false;
  }
}

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
    let { messages, model, web, conversationId } = body;

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

    // Check quota before processing
    try {
      await quotaManager.checkQuota(session.user.id, "small_messages", 1);
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return new Response(
          JSON.stringify({
            error: "Quota exceeded for small messages",
            details: error.message,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      throw error;
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

    let conversationCreationFailed = false;

    // Create a new conversation if no conversationId is provided
    if (!conversationId) {
      const userMessage = messages.find((msg: Message) => msg.role === "user");
      if (!userMessage) {
        return new Response(
          JSON.stringify({
            error: "No user message found to create conversation",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      const conversation = await createConversation(
        userMessage.content.slice(0, 100)
      );

      if (conversation) {
        conversationId = conversation.id;
      } else {
        conversationCreationFailed = true;
      }
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
    let messageSavingFailed = false;
    let quotaIncrementFailed = false;
    // Base sequence number for new messages
    let sequence_number = messages.length + 1;

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
            failures: {
              ...(conversationCreationFailed
                ? { conversationCreation: true }
                : {}),
              ...(quotaIncrementFailed ? { quotaExceeded: true } : {}),
            },
          });
        }
      )
      .then(async (response) => {
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
              sequence_number - 1
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
            sequence_number
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

        // Send final SSE with completion status
        await sendSSE({
          content: "",
          conversationId,
          usage: responseUsage,
          done: true,
          failures: {
            ...(conversationCreationFailed
              ? { conversationCreation: true }
              : {}),
            ...(messageSavingFailed ? { messageSaving: true } : {}),
            ...(quotaIncrementFailed ? { quotaExceeded: true } : {}),
          },
        });

        await writer.close();
      })
      .catch(async (error) => {
        console.error("Error in chat completion:", error);
        await sendSSE({
          error: error.message || "An error occurred during chat completion",
          done: true,
        });
        await writer.close();
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
