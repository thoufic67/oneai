/**
 * Shared conversation view page
 * Displays a read-only view of a shared conversation
 */

import { notFound } from "next/navigation";
// import { Message } from "@/components/chat/message";
import { ShareError } from "@/types/share";
import { ChatBubble } from "@/app/components/chat/ChatBubble";

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
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">{conversation.title}</h1>
            <p className="text-sm text-muted-foreground">
              Shared conversation • Read-only view
            </p>
          </div>

          <div className="space-y-6 pb-24 sm:pb-0">
            {messages.map((message: any) => (
              <ChatBubble
                isReadonly
                key={message.id}
                isAssistant={message.role === "assistant"}
                content={message.content}
                isLoading={false}
                model={message.model}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
