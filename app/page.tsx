import { ChatHeader, ChatTitle, ChatInput } from "@/components/chat";
import { Chat } from "@/components/chat/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-3xl mx-auto space-y-8">
        <Chat />
      </div>
    </main>
  );
}
