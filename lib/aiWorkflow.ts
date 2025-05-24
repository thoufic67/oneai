/**
 * aiWorkflow.ts
 * Shared workflow helpers for AI operations (chat, image, etc.).
 * Includes: request validation, quota checks, conversation creation, message saving, and quota incrementing.
 * Now supports saving attachments array for chat messages.
 */
import { cookies } from "next/headers";
import { QuotaManager } from "@/lib/quota";
import { QuotaExceededError } from "@/config/quota";
import { createClient } from "@/lib/supabase/server";

// 1. Validate request
export function validateRequest(type: "chat" | "image", body: any) {
  if (type === "chat") {
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new Error("Messages array is required and cannot be empty");
    }
    const isValidMessage = (msg: any) =>
      msg &&
      typeof msg === "object" &&
      ["user", "assistant", "system"].includes(msg.role) &&
      typeof msg.content === "string" &&
      msg.content.trim().length > 0;
    if (!body.messages.every(isValidMessage)) {
      throw new Error(
        "Invalid message format. Each message must have a valid role and non-empty content"
      );
    }
  } else if (type === "image") {
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new Error("Messages array is required and cannot be empty");
    }
    const userMessage = body.messages.find((msg: any) => msg.role === "user");
    if (!userMessage) {
      throw new Error("No user message found for image generation");
    }
  }
}

// 2. Check quota
export async function checkQuota(userId: string, type: "chat" | "image") {
  const supabase = await createClient();
  const quotaManager = new QuotaManager(supabase);
  const quotaKey = type === "chat" ? "small_messages" : "image_generation";
  await quotaManager.checkQuota(userId, quotaKey, 1);
}

// 3. Create conversation if needed
export async function createConversationIfNeeded(
  conversationId: string | undefined,
  userMessage: string
) {
  if (conversationId) return conversationId;
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/conversations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore.toString(),
      },
      body: JSON.stringify({ title: userMessage.slice(0, 100) }),
    }
  );
  if (!response.ok) return undefined;
  const data = await response.json();
  return data.conversation?.id;
}

// 4. Save message (user or AI)
export async function saveMessage(
  conversationId: string,
  content: string,
  role: string,
  tokensUsed: number,
  model_id: string,
  sequence_number: number,
  metadata: any = {},
  attachments?: Array<{ attachment_type: string; attachment_url: string }>
) {
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
        metadata: { ...metadata, tokens_used: tokensUsed },
        model_id,
        sequence_number,
        ...(attachments ? { attachments } : {}),
      }),
    }
  );
  return response.ok;
}

// 5. Increment quota
export async function incrementQuota(userId: string, type: "chat" | "image") {
  const supabase = await createClient();
  const quotaManager = new QuotaManager(supabase);
  const quotaKey = type === "chat" ? "small_messages" : "image_generation";
  await quotaManager.incrementQuota(userId, quotaKey, 1);
}
