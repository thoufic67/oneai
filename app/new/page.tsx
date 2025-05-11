"use client";

import { Chat } from "../components/chat/Chat";
import { useAuth } from "../components/auth-provider";
import { redirect } from "next/navigation";
export default function NewChat() {
  const { subscriptionData } = useAuth();

  return subscriptionData?.subscription?.status === "free" ||
    subscriptionData?.subscription === null ? (
    redirect("/pricing")
  ) : (
    <Chat />
  );
}
