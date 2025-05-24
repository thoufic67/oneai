import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Image generation types and provider interface
export interface ImageGenerationParams {
  prompt: string;
  messages?: Message[];
  n?: number; // number of images
  size?: string; // e.g., '1024x1024'
  user?: string;
  response_id?: string; // For OpenAI followup support
  followup?: boolean; // For OpenAI followup support
  [key: string]: any; // for provider-specific params
}

export interface ImageGenerationResult {
  id: string;
  choices: Array<{
    finish_reason: string;
    native_finish_reason: string;
    message: {
      role: string;
      content: string; // Markdown with image and optional description
      imageUrl?: string | null; // Direct URL or Supabase URL if uploaded
      description?: string; // Optional image description from model
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

// --- OpenAI Multi-turn Image Generation Types ---
export type OpenAIImageResponseOutput =
  | {
      type: "image_generation_call";
      id: string;
      result: string | null; // base64 image
      status: string;
    }
  | {
      type: "message";
      id: string;
      status: string;
      role: string;
      content: Array<{
        type: "output_text";
        text: string;
        annotations: any[];
      }>;
    };

export interface OpenAIImageResponse {
  id: string;
  object: string;
  created_at: number;
  status: string;
  model: string;
  output: OpenAIImageResponseOutput[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    [key: string]: any;
  };
  metadata: Record<string, any>;
  // Optional fields for flexibility and linter compatibility
  error?: any;
  incomplete_details?: any;
  instructions?: any;
  max_output_tokens?: any;
  parallel_tool_calls?: boolean;
  previous_response_id?: string | null;
  reasoning?: any;
  store?: boolean;
  temperature?: number;
  text?: any;
  tool_choice?: string;
  tools?: any[];
  top_p?: number;
  truncation?: string;
  user?: string | null;
}
