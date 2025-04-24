import { LazyChat } from "@/app/components/chat/LazyChat";
import { PasswordForm } from "@/app/components/PasswordForm";

export default function ConversationPage() {
  return (
    <div className="w-full mx-auto h-full">
      <PasswordForm>
        <LazyChat />
      </PasswordForm>
    </div>
  );
}
