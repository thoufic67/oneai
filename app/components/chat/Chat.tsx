"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { chatService } from "@/services/api";
import { ChatBubble } from "./ChatBubble";
import { GlowingInput } from "./GlowingInput";
import { Button, Chip } from "@heroui/react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}
interface Model {
  name: string;
  value: ModelType;
}

type ModelType =
  | "gpt-4o-mini"
  | "anthropic/claude-3.5-haiku"
  | "deepseek/deepseek-chat-v3-0324:free"
  | "deepseek/deepseek-r1-zero:free";

const models: Model[] = [
  {
    name: "GPT-4o-mini",
    value: "gpt-4o-mini",
  },
  {
    name: "Claude 3.5",
    value: "anthropic/claude-3.5-haiku",
  },
  {
    name: "DeepSeek-V3-0324",
    value: "deepseek/deepseek-chat-v3-0324:free",
  },
  {
    name: "DeepSeek-R1-Zero",
    value: "deepseek/deepseek-r1-zero:free",
  },
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelType>(
    models[2].value
  );
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async () => {
    if (inputMessage.trim().length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = { role: "user", content: inputMessage };
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");

      // Initialize streaming message
      setStreamingMessage({ role: "assistant", content: "" });

      // Get AI response with streaming
      await chatService.createChatCompletion(
        {
          messages: [...messages, userMessage],
          stream: true,
          model: selectedModel,
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
          inputRef.current?.focus();
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
    return messages;
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100dvh-2rem)] md:h-[calc(100dvh-2rem)] mx-auto">
      {messages.length === 0 ? (
        <div className="flex flex-col h-full justify-center items-center">
          <motion.div className="flex flex-col justify-center items-center gap-4 mb-8">
            <p className="text-left text-3xl font-normal delay-100 sm:text-4xl md:text-5xl leading-9">
              <span className="drop-shadow-2xl relative mb-5 duration-700 transition-[opacity,filter] text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                Hello!
              </span>
              <br />
              <span className="drop-shadow-2xl text-gray-500">
                How can I help you today?
              </span>
            </p>
          </motion.div>
          <div className="w-full max-w-3xl px-4">
            <div className="flex flex-col gap-2">
              <GlowingInput
                ref={inputRef}
                disabled={isLoading}
                value={inputMessage}
                onValueChange={setInputMessage}
                placeholder="Ask AI anything"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                endContent={
                  <Button
                    isIconOnly
                    variant="ghost"
                    radius="full"
                    onPress={handleSubmit}
                    isDisabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                }
              />
              <div className="flex gap-2 justify-center">
                {models.map((model) => (
                  <Chip
                    key={model.value}
                    variant={selectedModel === model.value ? "flat" : "light"}
                    color="secondary"
                    radius="full"
                    className="cursor-pointer"
                    onClick={() => setSelectedModel(model.value as ModelType)}
                  >
                    {model.name}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden gap-4 w-full no-scrollbar p-4"
            ref={chatContainerRef}
          >
            {displayMessages.map((message, index) => (
              <ChatBubble
                key={index}
                isAssistant={message.role === "assistant"}
                content={message.content}
                isLoading={message === streamingMessage && isLoading}
              />
            ))}
            {streamingMessage && (
              <ChatBubble
                isAssistant={true}
                content={streamingMessage.content}
                isLoading={true}
              />
            )}
          </div>

          {error && (
            <div className="p-4 text-red-500 bg-red-100 rounded">{error}</div>
          )}

          <div className="sticky bottom-0 left-0 right-0 w-full bg-background/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex flex-col gap-2">
                <GlowingInput
                  ref={inputRef}
                  disabled={isLoading}
                  value={inputMessage}
                  onValueChange={setInputMessage}
                  placeholder="Ask AI anything"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      variant="ghost"
                      radius="full"
                      onPress={handleSubmit}
                      isDisabled={isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  }
                />
                <div className="flex gap-2 justify-center">
                  {models.map((model) => (
                    <Chip
                      key={model.value}
                      variant={selectedModel === model.value ? "flat" : "light"}
                      color="secondary"
                      radius="full"
                      className="cursor-pointer"
                      onClick={() => setSelectedModel(model.value as ModelType)}
                    >
                      {model.name}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
