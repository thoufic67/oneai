/**
 * API route for sharing conversations
 * Handles share link generation and management
 */

import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ShareError, ShareResponse } from "@/types/share";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  //Get the share record if it exists
  const supabase = await createClient();
  const { data: share, error: shareError } = await supabase
    .from("shared_conversations")
    .select("*")
    .eq("conversation_id", id)
    .eq("is_active", true)
    .single();

  if (shareError) {
    console.error("Error getting share:", shareError);
    return NextResponse.json<ShareError>(
      { message: "Failed to get share", code: "INTERNAL_ERROR" },
      { status: 404 }
    );
  }

  return NextResponse.json<ShareResponse>({
    share_id: share.share_id,
    share_url: share.share_url,
  });
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ShareError>(
        { message: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Check if conversation exists and user owns it
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json<ShareError>(
        { message: "Conversation not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // Generate unique share ID
    const share_id = nanoid(10);

    // Create share record
    const { data: share, error: shareError } = await supabase
      .from("shared_conversations")
      .insert({
        conversation_id: id,
        user_id: user.id,
        share_id,
        is_active: true,
      })
      .select()
      .single();

    if (shareError) {
      console.error("Error creating share:", shareError);
      return NextResponse.json<ShareError>(
        { message: "Failed to create share", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    // Generate share URL
    const share_url = `${process.env.NEXT_PUBLIC_APP_URL}/share/${share_id}`;

    return NextResponse.json<ShareResponse>({
      share_id,
      share_url,
    });
  } catch (error) {
    console.error("Share creation error:", error);
    return NextResponse.json<ShareError>(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json<ShareError>(
        { message: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Delete share record
    const { error: deleteError } = await supabase
      .from("shared_conversations")
      .delete()
      .eq("conversation_id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting share:", deleteError);
      return NextResponse.json<ShareError>(
        { message: "Failed to delete share", code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Share deletion error:", error);
    return NextResponse.json<ShareError>(
      { message: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
