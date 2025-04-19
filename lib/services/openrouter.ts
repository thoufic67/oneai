import axios from "axios";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  web?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  usage?: UsageData;
}

export class OpenRouterService {
  private readonly baseUrl = "https://openrouter.ai/api/v1";
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly defaultSystemPrompt: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY!;
    this.defaultModel =
      process.env.NEXT_PUBLIC_DEFAULT_MODEL || "openai/gpt-3.5-turbo";
    this.defaultSystemPrompt =
      process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
      "You are a helpful AI assistant.";
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string, usage?: Partial<UsageData>) => void
  ): Promise<ChatCompletionResponse> {
    const { messages, model = this.defaultModel, stream = true } = request;

    // Add system prompt if not already present
    const hasSystemMessage = messages.some((msg) => msg.role === "system");
    const processedMessages = hasSystemMessage
      ? messages
      : [{ role: "system", content: this.defaultSystemPrompt }, ...messages];

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "X-Version": "1.0.0",
      };

      // Only add headers if they are defined
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL;
      }
      if (process.env.NEXT_PUBLIC_SITE_NAME) {
        headers["X-Title"] = process.env.NEXT_PUBLIC_SITE_NAME;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: processedMessages,
          model,
          stream,
          plugins: request.web ? [{ id: "web" }] : [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!stream) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        return {
          content,
          usage: data.usage as UsageData,
        };
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      let fullResponse = "";
      let usageData: Partial<UsageData> | undefined;
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim() === "" || line.includes("[DONE]")) continue;

            try {
              if (!line.startsWith("data: ")) continue;

              const jsonString = line.replace(/^data: /, "").trim();
              if (!jsonString) continue;

              const json = JSON.parse(jsonString);
              const content = json.choices?.[0]?.delta?.content ?? "";

              if (json.usage) {
                usageData = json.usage;
                if (onChunk && content) {
                  onChunk(content, usageData);
                }
              } else if (content) {
                fullResponse += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (error) {
              console.error("Error parsing SSE chunk:", error);
              console.debug("Problematic line:", line);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim() && buffer.startsWith("data: ")) {
          try {
            const jsonString = buffer.replace(/^data: /, "").trim();
            if (jsonString && !jsonString.includes("[DONE]")) {
              const json = JSON.parse(jsonString);
              const content = json.choices?.[0]?.delta?.content ?? "";

              if (json.usage && !usageData) {
                usageData = json.usage;
              }

              if (content) {
                fullResponse += content;
                if (onChunk) {
                  onChunk(content, usageData);
                }
              }
            }
          } catch (error) {
            console.error("Error parsing final SSE chunk:", error);
          }
        }

        return {
          content: fullResponse,
          usage: usageData as UsageData | undefined,
        };
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("OpenRouter API error:", error);
        throw new Error(`OpenRouter API error: ${error.message}`);
      }
      throw error;
    }
  }
}
