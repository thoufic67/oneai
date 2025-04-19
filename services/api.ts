import axios from "axios";
import api from "./axiosSetup";
import { authService } from "./authService";

interface UsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

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
  last_message_at: string;
  metadata?: Record<string, any>;
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

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

interface StreamResponse {
  content?: string;
  conversationId?: string;
  usage?: Partial<UsageData>;
  error?: string;
  done?: boolean;
}

class ChatService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
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
        const response = await api.post(`${this.baseUrl}/chat/stream`, request);
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
    const token = await authService.getCurrentUser();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let fullResponse = "";
    let currentConversationId = request.conversationId || "";
    let currentUsage: Partial<UsageData> | undefined;

    try {
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

            const json = JSON.parse(jsonString) as StreamResponse;

            // Handle error message
            if (json.error) {
              throw new Error(json.error);
            }

            // Handle done message
            if (json.done) {
              if (json.conversationId) {
                currentConversationId = json.conversationId;
              }
              onFinal?.(fullResponse, currentConversationId);
              return {
                text: fullResponse,
                conversationId: currentConversationId,
                usage: currentUsage,
              };
            }

            // Handle content and usage
            if (json.content) {
              fullResponse += json.content;
              onChunk?.(json.content, currentConversationId);
            }

            if (json.usage) {
              currentUsage = json.usage;
            }

            if (json.conversationId) {
              currentConversationId = json.conversationId;
            }
          } catch (error) {
            console.error("Error parsing SSE chunk:", error);
            throw error;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      text: fullResponse,
      conversationId: currentConversationId,
      usage: currentUsage,
    };
  }

  // --- Conversation Management Methods ---

  async getConversations(
    params: {
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<Conversation>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", params.limit?.toString() || "10");
      if (params.offset) queryParams.set("offset", params.offset.toString());
      if (params.search) queryParams.set("search", params.search);

      const response = await api.get(
        `${this.baseUrl}/conversations?${queryParams.toString()}`
      );
      return response.data;
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
      const response = await api.get(`${this.baseUrl}/conversations/${id}`);
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
    conversationId: string,
    params: {
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ): Promise<PaginatedResponse<ChatMessage>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.limit) queryParams.set("limit", params.limit.toString());
      if (params.offset) queryParams.set("offset", params.offset.toString());
      if (params.search) queryParams.set("search", params.search);

      const response = await api.get(
        `${this.baseUrl}/conversations/${conversationId}/messages?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error fetching messages: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async createConversation(
    title: string,
    metadata?: Record<string, any>
  ): Promise<Conversation> {
    try {
      const response = await api.post(`${this.baseUrl}/conversations`, {
        title,
        metadata,
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

  async updateConversation(
    id: string,
    updates: { title?: string; metadata?: Record<string, any> }
  ): Promise<Conversation> {
    try {
      const response = await api.patch(
        `${this.baseUrl}/conversations/${id}`,
        updates
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
      await api.delete(`${this.baseUrl}/conversations/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error deleting conversation: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }

  async addMessage(
    conversationId: string,
    content: string,
    options: {
      role?: "user" | "assistant" | "system";
      model_id?: string;
      parent_message_id?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ChatMessage> {
    try {
      const response = await api.post(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        {
          content,
          ...options,
        }
      );
      return response.data.message;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Error adding message: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }
}

export const chatService = new ChatService();
export type { Conversation, ChatMessage, Message, PaginatedResponse };
