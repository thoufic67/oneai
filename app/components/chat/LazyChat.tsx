"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load the Chat component
const ChatComponent = dynamic(
  () => import("./Chat").then((mod) => ({ default: mod.Chat })),
  {
    loading: () => <ChatLoadingState />,
    ssr: false,
  }
);

// Simple loading state
function ChatLoadingState() {
  return (
    <div className="flex justify-center items-center h-[calc(100dvh-1rem)] md:h-[calc(100dvh-4rem)]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
    </div>
  );
}

export function LazyChat() {
  return (
    <Suspense fallback={<ChatLoadingState />}>
      <ChatComponent />
    </Suspense>
  );
}
