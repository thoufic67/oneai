import { LazyChat } from "@/app/components/chat/LazyChat";
import { ProtectedRoute } from "@/app/components/protected-route";

export default function NewChat() {
  return (
    <ProtectedRoute>
      <LazyChat />
    </ProtectedRoute>
  );
}
