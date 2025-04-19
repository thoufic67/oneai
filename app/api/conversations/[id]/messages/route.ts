import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const id = (await params).id;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search") || "";

    const supabase = await createClient();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("looking for conversation", {
      id,
      userId: user.id,
      url: request.url,
      searchParams,
    });

    // First verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    let query = supabase
      .from("chat_messages")
      .select("*", { count: "exact" })
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("content", `%${search}%`);
    }

    const { data: messages, error, count } = await query;

    if (error) {
      console.error("Error fetching messages:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      messages,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const id = (await params).id;
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation ownership
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Messages not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      content,
      role = "user",
      model_id,
      parent_message_id,
      sequence_number,
      metadata = {},
    } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    console.log("inserting message", {
      content,
      role,
      model_id,
      parent_message_id,
      metadata,
      conversation_id: id,
      user_id: user.id,
      body,
    });

    // Insert the message
    const { data: message, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: id,
        user_id: user.id,
        content,
        role,
        model_id,
        parent_message_id,
        metadata,
        sequence_number: sequence_number,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating message:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update conversation's last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
