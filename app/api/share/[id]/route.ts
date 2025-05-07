/**
 * API route for accessing shared conversations
 * Handles fetching shared conversation data
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { ShareError } from "@/types/share";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
  sequence_number: number;
  is_latest: boolean;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    // Get the shared conversation
    console.log("Fetching shared conversation with id", id);
    const { data: share, error: shareError } = await supabase
      .from("shared_conversations")
      .select(
        `
        *,
        conversation:conversations!fk_conversation (
          id,
          title,
          created_at,
          messages:chat_messages (
            id,
            role,
            content,
            model_id,
            created_at,
            sequence_number,
            is_latest
          )
        )
      `
      )
      .eq("share_id", id)
      .eq("is_active", true)
      .single();

    if (shareError || !share) {
      console.error("Share not found", shareError);
      return NextResponse.json<ShareError>(
        { message: "Share not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Check if share has expired
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json<ShareError>(
        { message: "Share has expired", code: "EXPIRED" },
        { status: 410 }
      );
    }

    console.log("Share data", share, shareError);

    // Filter messages to only include latest versions
    const messages = share.conversation.messages
      .filter((msg: ChatMessage) => msg.is_latest)
      .sort(
        (a: ChatMessage, b: ChatMessage) =>
          a.sequence_number - b.sequence_number
      );

    // Return conversation data
    return NextResponse.json({
      conversation: {
        ...share.conversation,
        messages,
      },
    });
  } catch (error) {
    console.error("Share access error:", error);
    return NextResponse.json<ShareError>(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
