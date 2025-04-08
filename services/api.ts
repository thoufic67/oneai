import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
}

class ChatService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string) => void,
    onFinal?: (final: string) => void
  ) {
    try {
      if (request.stream) {
        return this.handleStreamingRequest(request, onChunk, onFinal);
      } else {
        const response = await axios.post(
          `${this.baseUrl}/v1/chat/stream`,
          request
        );
        return response.data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Chat API error: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  private async handleStreamingRequest(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string) => void,
    onFinal?: (final: string) => void
  ) {
    const response = await fetch(`${this.baseUrl}/v1/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        if (line === "[DONE]") continue;

        try {
          const jsonString = line.replace(/^data: /, "").trim();
          if (!jsonString || !line.startsWith("data: ")) continue;

          // Handle [DONE] message
          if (jsonString === "[DONE]") {
            onFinal?.(fullResponse);
            return fullResponse;
          }

          const json = JSON.parse(jsonString);
          const content = json.content ?? "";

          if (content) {
            fullResponse += content;
            onChunk?.(content);
          }
        } catch (error) {
          console.error("Error parsing SSE chunk:", error);
        }
      }
    }

    return fullResponse;
  }
}

export const chatService = new ChatService();
