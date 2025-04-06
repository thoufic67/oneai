"use client";

import { useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatView } from "./ChatView";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = async (content: string) => {
    // Add user message
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response (replace this with actual API call)
    const aiMessage: Message = {
      role: "assistant",
      content:
        "This is a simulated AI response. Replace this with actual API integration.",
    };

    // Add AI response after a short delay to simulate processing
    setTimeout(() => {
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.length > 0 ? (
        <>
          <ChatView messages={messages} />
          <ChatInput onSubmit={handleSubmit} />
        </>
      ) : (
        <ChatInput onSubmit={handleSubmit} />
      )}
    </div>
  );
}
