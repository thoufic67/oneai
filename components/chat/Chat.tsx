"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ChatInput, ChatInputHandle } from "./ChatInput";
import { ChatView } from "./ChatView";
import { chatService } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const chatInputRef = useRef<ChatInputHandle>(null);

  useEffect(() => {
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = { role: "user", content };
      setMessages((prev) => [...prev, userMessage]);

      // Initialize streaming message
      setStreamingMessage({ role: "assistant", content: "" });

      // Get AI response with streaming
      await chatService.createChatCompletion(
        {
          messages: [...messages, userMessage],
          stream: true,
        },
        (chunk) => {
          // Immediately update UI with each chunk
          setStreamingMessage((prev) =>
            prev
              ? { ...prev, content: prev.content + chunk }
              : { role: "assistant", content: chunk }
          );
        },
        (final) => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: final },
          ]);
          setStreamingMessage(null);
          // Focus the chat input after response is complete
          chatInputRef.current?.focus();
        }
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Chat error:", error);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Combine regular messages with streaming message for display
  const displayMessages = useMemo(() => {
    return streamingMessage !== null
      ? [...messages, streamingMessage]
      : messages;
  }, [messages, streamingMessage]);

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-4 text-red-500 bg-red-100 rounded">{error}</div>
      )}
      {displayMessages.length > 0 ? (
        <>
          <ChatView messages={displayMessages} />
          <ChatInput
            ref={chatInputRef}
            onSubmit={handleSubmit}
            disabled={isLoading}
          />
        </>
      ) : (
        <ChatInput
          ref={chatInputRef}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      )}
    </div>
  );
}
