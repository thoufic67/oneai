import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatCompletionRequest {
  messages: Message[];
  model?: string;
  stream?: boolean;
  web?: boolean;
  conversationId?: string;
}

// API response interfaces
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  model_id: string;
  content: string;
  tokens_used?: number;
  parent_message_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

class ChatService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
  }

  async createChatCompletion(
    request: ChatCompletionRequest,
    onChunk?: (chunk: string, conversationId: string) => void,
    onFinal?: (final: string, conversationId: string, title?: string) => void
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
    onChunk?: (chunk: string, conversationId: string) => void,
    onFinal?: (final: string, conversationId: string, title?: string) => void
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
    let currentConversationId = request.conversationId || "";
    let conversationTitle = "";

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
            onFinal?.(fullResponse, currentConversationId, conversationTitle);
            return {
              text: fullResponse,
              conversationId: currentConversationId,
              title: conversationTitle || undefined,
            };
          }

          const json = JSON.parse(jsonString);

          // Check if this is the done message with a title
          if (json.done) {
            if (json.conversationId) {
              currentConversationId = json.conversationId;
            }
            if (json.title) {
              conversationTitle = json.title;
            }
            onFinal?.(fullResponse, currentConversationId, conversationTitle);
            return {
              text: fullResponse,
              conversationId: currentConversationId,
              title: conversationTitle || undefined,
            };
          }

          const content = json.content ?? "";

          // Extract conversationId if present
          if (json.conversationId) {
            currentConversationId = json.conversationId;
          }

          if (content) {
            fullResponse += content;
            onChunk?.(content, currentConversationId);
          }
        } catch (error) {
          console.error("Error parsing SSE chunk:", error);
        }
      }
    }

    return {
      text: fullResponse,
      conversationId: currentConversationId,
      title: conversationTitle || undefined,
    };
  }

  // --- Conversation Management Methods ---

  async getConversations(limit = 10): Promise<Conversation[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/conversations?limit=${limit}`
      );
      return response.data.conversations;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching conversations: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/conversations/${id}`
      );
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<ChatMessage[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/conversations/${conversationId}/messages`
      );
      return response.data.messages;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching messages: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async createConversation(title: string): Promise<Conversation> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/conversations`, {
        title,
      });
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error creating conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async updateConversation(id: string, title: string): Promise<Conversation> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/v1/conversations/${id}`,
        { title }
      );
      return response.data.conversation;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error updating conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/v1/conversations/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error deleting conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }
}

export const chatService = new ChatService();
export type { Conversation, ChatMessage, Message };
