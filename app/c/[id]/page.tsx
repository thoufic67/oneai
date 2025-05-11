import { Chat } from "@/app/components/chat/Chat";
import type { Conversation, ChatMessage } from "@/services/api";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

// File: app/c/[id]/page.tsx
// Description: Server component for conversation page. Fetches conversation messages and details server-side from API routes, forwarding cookies for authentication, and passes them to Chat as props.

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const cookie = (await headers()).get("cookie") ?? "";

  let conversation: Conversation | undefined = undefined;
  let messages: ChatMessage[] = [];
  let error: string | null = null;

  try {
    // Fetch conversation details
    const convRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/conversations/${id}`,
      {
        headers: { cookie },
        cache: "no-store",
      }
    );
    if (!convRes.ok) {
      const err = await convRes.json();
      throw new Error(err.error || "Failed to load conversation");
    }
    const convData = await convRes.json();
    conversation = convData.conversation;

    // Fetch messages
    const msgRes = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/conversations/${id}/messages`,
      {
        headers: { cookie },
        cache: "no-store",
      }
    );
    if (!msgRes.ok) {
      const err = await msgRes.json();
      throw new Error(err.error || "Failed to load messages");
    }
    const msgData = await msgRes.json();
    messages = msgData.data;
  } catch (e: any) {
    error = e?.message || "Failed to load conversation";
  }

  if (error) {
    return notFound();
  }

  return (
    <div className="w-full mx-auto h-full">
      <Chat initialMessages={messages} initialConversation={conversation} />
    </div>
  );
}
