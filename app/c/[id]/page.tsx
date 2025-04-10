import { LazyChat } from "@/app/components/chat/LazyChat";
import { PasswordForm } from "@/app/components/PasswordForm";

export default function ConversationPage() {
  return (
    <div className="w-full mx-auto space-y-8">
      <PasswordForm>
        <LazyChat />
      </PasswordForm>
    </div>
  );
}
