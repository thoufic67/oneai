import { ChatHeader, ChatTitle, ChatInput } from "@/app/components/chat";
import { Chat } from "@/app/components/chat/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-4">
      <div className="w-full  mx-auto space-y-8">
        <Chat />
      </div>
    </main>
  );
}
