import { LazyChat } from "@/app/components/chat/LazyChat";
import { PasswordForm } from "@/app/components/PasswordForm";
import { ProtectedRoute } from "@/app/components/protected-route";

export default function NewChat() {
  return (
    <ProtectedRoute>
      <PasswordForm>
        <LazyChat />
      </PasswordForm>
    </ProtectedRoute>
  );
}
