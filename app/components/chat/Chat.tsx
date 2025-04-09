"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { chatService } from "@/services/api";
import { ChatBubble } from "./ChatBubble";
import { OneAIInput } from "./OneAIInput";
import { Sidebar } from "./Sidebar";
import { Button } from "@heroui/react";
import { AlertCircle, Send, Plus, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  model: ModelType;
  webSearchEnabled: boolean;
}

interface Model {
  name: string;
  value: ModelType;
}

type ModelType =
  | "gpt-4o-mini"
  | "anthropic/claude-3.5-haiku"
  | "anthropic/claude-3.7-sonnet"
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
    name: "Claude 3.7",
    value: "anthropic/claude-3.7-sonnet",
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
    models[0].value
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("oneai-chat-history");
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats) as ChatSession[];
        setChatHistory(parsedChats);

        // If there's an active chat, load it
        if (parsedChats.length > 0) {
          const mostRecentChat = parsedChats.sort(
            (a: ChatSession, b: ChatSession) => b.timestamp - a.timestamp
          )[0];
          setCurrentChatId(mostRecentChat.id);
          setMessages(mostRecentChat.messages);
          setSelectedModel(mostRecentChat.model);
          setWebSearchEnabled(mostRecentChat.webSearchEnabled);
        }
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    }
  }, []);

  // Save chat history when messages or current chat changes
  useEffect(() => {
    if (!currentChatId || messages.length === 0) return;

    // Update the current chat in history
    setChatHistory((prevHistory) => {
      const updatedHistory = prevHistory.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              messages,
              timestamp: Date.now(),
              model: selectedModel,
              webSearchEnabled,
            }
          : chat
      );

      localStorage.setItem(
        "oneai-chat-history",
        JSON.stringify(updatedHistory)
      );
      return updatedHistory;
    });
  }, [messages, currentChatId, selectedModel, webSearchEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSubmit = async () => {
    if (inputMessage.trim().length === 0) return;

    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: Message = { role: "user", content: inputMessage };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage("");

      // Create a new chat if this is the first message
      if (!currentChatId) {
        const newChatId = uuidv4();
        const newChat: ChatSession = {
          id: newChatId,
          title:
            userMessage.content.slice(0, 30) +
            (userMessage.content.length > 30 ? "..." : ""),
          messages: updatedMessages,
          timestamp: Date.now(),
          model: selectedModel,
          webSearchEnabled,
        };

        setCurrentChatId(newChatId);
        setChatHistory((prevHistory) => {
          const newChatHistory = [newChat, ...prevHistory];
          localStorage.setItem(
            "oneai-chat-history",
            JSON.stringify(newChatHistory)
          );
          return newChatHistory;
        });
      }

      // Initialize streaming message
      setStreamingMessage({ role: "assistant", content: "" });

      // Get AI response with streaming
      await chatService.createChatCompletion(
        {
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
          model: selectedModel,
          web: webSearchEnabled,
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
          const finalResponse: Message = { role: "assistant", content: final };
          const finalMessages = [...updatedMessages, finalResponse];
          setMessages(finalMessages);
          setStreamingMessage(null);

          // Update chat history with assistant's response
          if (currentChatId) {
            setChatHistory((prevHistory) => {
              const updatedHistory = prevHistory.map((chat) =>
                chat.id === currentChatId
                  ? {
                      ...chat,
                      messages: finalMessages,
                      timestamp: Date.now(),
                      model: selectedModel,
                      webSearchEnabled,
                    }
                  : chat
              );

              localStorage.setItem(
                "oneai-chat-history",
                JSON.stringify(updatedHistory)
              );
              return updatedHistory;
            });
          }

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

  const handleNewChat = () => {
    setMessages([]);
    setStreamingMessage(null);
    setError(null);
    setInputMessage("");
    setCurrentChatId(null);
    setSelectedModel(models[0].value);
    setWebSearchEnabled(false);
    setSidebarExpanded(false);
    inputRef.current?.focus();
  };

  const handleSelectChat = (chatId: string) => {
    const selectedChat = chatHistory.find((chat) => chat.id === chatId);
    if (selectedChat) {
      setCurrentChatId(chatId);
      setMessages(selectedChat.messages);
      setSelectedModel(selectedChat.model);
      setWebSearchEnabled(selectedChat.webSearchEnabled);
      setStreamingMessage(null);
      setError(null);
      setInputMessage("");
      setSidebarExpanded(false);
    }
  };

  // Combine regular messages with streaming message for display
  const displayMessages = useMemo(() => {
    return messages;
  }, [messages]);

  // Create shared input component to avoid duplication
  const renderChatInput = () => (
    <div className="flex flex-col gap-2">
      <OneAIInput
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
        modelOptions={models}
        selectedModel={selectedModel}
        onModelChange={(model) => setSelectedModel(model as ModelType)}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={setWebSearchEnabled}
      />
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-2rem)] md:h-[calc(100dvh-2rem)]">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
      />

      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              className="flex flex-col h-full justify-center items-center -mt-24"
            >
              <motion.div className="flex flex-col justify-center items-center gap-4 mb-8">
                <p className="text-left text-xl font-normal delay-100 sm:text-2xl md:text-3xl leading-9">
                  <span className="drop-shadow-2xl relative mb-5 duration-700 transition-[opacity,filter] text-transparent bg-clip-text bg-gradient-to-r to-purple-400 from-pink-600">
                    Hello!
                  </span>{" "}
                  <span className="drop-shadow-2xl text-gray-500">
                    How can I help you today?
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="w-full max-w-3xl px-4"
                layout
                layoutId="chat-input-container"
              >
                {renderChatInput()}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-view"
              className="flex flex-col h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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
                <Image
                  src="/loading-animation.svg"
                  alt="logo"
                  width={100}
                  height={100}
                  className={`w-8 h-8 ${isLoading ? "animate-spin" : ""}`}
                />
              </div>

              {error && (
                <div className="p-4 text-red-500 bg-red-100 rounded mb-4 mx-auto flex items-center gap-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error || "An error occurred"}
                </div>
              )}

              <motion.div
                className="sticky bottom-0 left-0 right-0 w-full backdrop-blur-md border-t border-gray-200 dark:border-gray-800"
                layout
                layoutId="chat-input-container"
              >
                <div className="max-w-3xl mx-auto p-4">{renderChatInput()}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
