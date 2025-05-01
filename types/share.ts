/**
 * Types for the share functionality
 */

export interface SharedConversation {
  id: string;
  conversation_id: string;
  user_id: string;
  share_id: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface ShareResponse {
  share_id: string;
  share_url: string;
}

export interface ShareError {
  message: string;
  code:
    | "NOT_FOUND"
    | "UNAUTHORIZED"
    | "EXPIRED"
    | "INACTIVE"
    | "INTERNAL_ERROR";
}
