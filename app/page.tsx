import { Chat } from "@/app/components/chat/Chat";
import { PasswordForm } from "@/app/components/PasswordForm";

export default function Home() {
  return (
    <div className="w-full mx-auto space-y-8">
      <PasswordForm>
        <Chat />
      </PasswordForm>
    </div>
  );
}
