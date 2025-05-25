/**
 * Shared conversation view page
 * Displays a read-only view of a shared conversation
 *
 * Now also sets the page description dynamically based on the conversation title.
 */

import { notFound } from "next/navigation";
// import { Message } from "@/components/chat/message";
import { ShareError } from "@/types/share";
import { ChatBubble } from "@/app/components/chat/ChatBubble";
import { Metadata } from "next";

interface SharedConversationPageProps {
  params: Promise<{ id: string }>;
}

export default async function SharedConversationPage({
  params,
}: SharedConversationPageProps) {
  const id = (await params).id;
  // Fetch data from the API endpoint
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/share/${id}`
  );

  if (!response.ok) {
    const error: ShareError = await response.json();
    if (error.code === "EXPIRED") {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold mb-2">Share Expired</h1>
          <p className="text-muted-foreground">
            This shared conversation has expired and is no longer available.
          </p>
        </div>
      );
    }
    notFound();
  }

  const { conversation } = await response.json();
  console.log("conversation ", JSON.stringify(conversation));

  // Filter and sort messages
  const messages = conversation.messages
    .filter((msg: any) => msg.is_latest)
    .sort((a: any, b: any) => a.sequence_number - b.sequence_number);

  return (
    <div className="flex overflow-y-auto h-screen">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="space-y-8 pt-24 ">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{conversation.title}</h1>
            <p className="text-sm text-muted-foreground">
              Shared conversation • Read-only view
            </p>
          </div>

          <div className="space-y-6 pb-24">
            {messages.map((message: any) => (
              <ChatBubble
                isReadonly
                isShare
                key={message.id}
                isAssistant={message.role === "assistant"}
                content={message.content}
                isLoading={false}
                model={message.model_id}
                attachments={message.attachments}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this function to dynamically set metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const id = (await params).id;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/share/${id}`
    );
    if (!response.ok) throw new Error("Not found");
    const { conversation } = await response.json();
    return {
      title: conversation.title,
      description: `Shared conversation: ${conversation.title}`,
    };
  } catch {
    return {
      title: "Shared Conversation",
      description: "This is a shared conversation view.",
    };
  }
}
