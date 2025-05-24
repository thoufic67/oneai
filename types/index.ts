import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Image generation types and provider interface
export interface ImageGenerationParams {
  prompt: string;
  n?: number; // number of images
  size?: string; // e.g., '1024x1024'
  user?: string;
  [key: string]: any; // for provider-specific params
}

export interface ImageGenerationResult {
  id: string;
  choices: Array<{
    finish_reason: string;
    native_finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export interface ImageGenerationProvider {
  generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult>;
}

// --- Chat & Message Types ---
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  attachments?: Array<{
    attachment_type: "image" | "video" | "audio" | "document" | "other";
    attachment_url: string;
  }>;
}

export interface ChatMessage {
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
  sequence_number?: number;
  revision_number?: number;
  attachments?: Array<{
    attachment_type: "image" | "video" | "audio" | "document" | "other";
    attachment_url: string;
  }>;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  metadata?: Record<string, any>;
}

export interface StreamResponse {
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

export interface UsageData {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export interface UploadedImageMeta {
  url: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

// --- ModelType re-export ---
export type { ModelType } from "@/lib/models";
