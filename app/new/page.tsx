import { LazyChat } from "@/app/components/chat/LazyChat";
import { ProtectedRoute } from "@/app/components/protected-route";
import { Chat } from "../components/chat/Chat";

export default function NewChat() {
  return (
    // <ProtectedRoute>
    <Chat />
    // </ProtectedRoute>
  );
}
