import { Chat } from "@/app/components/chat/Chat";
import { PasswordForm } from "@/app/components/PasswordForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-4">
      <div className="w-full mx-auto space-y-8">
        <PasswordForm>
          <Chat />
        </PasswordForm>
      </div>
    </main>
  );
}
