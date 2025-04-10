"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  chatService,
  Message,
  Conversation,
  ChatMessage,
} from "@/services/api";
import { ChatBubble } from "./ChatBubble";
import { OneAIInput } from "./OneAIInput";
import { Sidebar } from "./Sidebar";
import { Button, Navbar, NavbarBrand, NavbarContent } from "@heroui/react";
import { AlertCircle, Send, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type ModelType =
  | "gpt-4o-mini"
  | "anthropic/claude-3.5-haiku"
  | "anthropic/claude-3.7-sonnet"
  | "deepseek/deepseek-chat-v3-0324:free"
  | "deepseek/deepseek-r1-zero:free";

interface Model {
  name: string;
  value: ModelType;
}

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
  // State for current messages display
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
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [newConversation, setNewConversation] = useState<
    Conversation | undefined
  >(undefined);
  const [currentConversation, setCurrentConversation] = useState<
    Conversation | undefined
  >(undefined);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load conversation messages when a conversation is selected
  const loadConversationMessages = async (conversationId: string) => {
    try {
      setLoadingConversation(true);
      const messagesData =
        await chatService.getConversationMessages(conversationId);

      // Also get the conversation details
      const conversationDetails =
        await chatService.getConversation(conversationId);
      setCurrentConversation(conversationDetails);

      // Convert API messages to component format
      const formattedMessages: Message[] = messagesData.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      setMessages(formattedMessages);

      // Update model if present in message metadata
      // Note: This would need to be implemented on the backend to store model in message metadata
    } catch (error) {
      console.error("Error loading conversation messages:", error);
      setError("Failed to load conversation messages");
    } finally {
      setLoadingConversation(false);
    }
  };

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

      // Add user message to UI for immediate feedback
      const userMessage: Message = { role: "user", content: inputMessage };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage("");

      // Prepare message history for API call
      const messageHistory: Message[] = updatedMessages;

      // Initialize streaming message
      setStreamingMessage({ role: "assistant", content: "" });

      // Get AI response with streaming
      const { text, conversationId, title } =
        await chatService.createChatCompletion(
          {
            messages: messageHistory,
            stream: true,
            model: selectedModel,
            web: webSearchEnabled,
            conversationId: currentChatId || undefined,
          },
          (chunk, convId) => {
            // Immediately update UI with each chunk
            setStreamingMessage((prev) =>
              prev
                ? { ...prev, content: prev.content + chunk }
                : { role: "assistant", content: chunk }
            );

            // If we got a new conversation ID and we didn't have one before, update it
            if (convId && !currentChatId) {
              setCurrentChatId(convId);

              // Create a temporary conversation with default title (will be updated later)
              const tempTitle =
                userMessage.content.slice(0, 30) +
                (userMessage.content.length > 30 ? "..." : "");
              const tempConversation: Conversation = {
                id: convId,
                title: tempTitle,
                user_id: "", // Will be filled by the backend
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setNewConversation(tempConversation);
            }
          },
          async (finalText, convId, generatedTitle) => {
            if (convId && currentChatId !== convId) {
              setCurrentChatId(convId);

              // If we have a title from auto-generation, update the conversation object
              if (generatedTitle) {
                try {
                  // First update the conversation in the backend
                  const updatedConversation =
                    await chatService.updateConversation(
                      convId,
                      generatedTitle
                    );

                  // Then update our local state to update the sidebar
                  setNewConversation(updatedConversation);
                } catch (error) {
                  console.error("Error updating conversation title:", error);
                }
              }
            }

            // Load the full conversation messages from the API after response
            if (convId) {
              await loadConversationMessages(convId);
            }

            setStreamingMessage(null);

            // Focus the chat input after response is complete
            inputRef.current?.focus();
          }
        );

      // If this is a new conversation and we got a title immediately, update it
      if (title && conversationId && !currentChatId) {
        try {
          const updatedConversation = await chatService.updateConversation(
            conversationId,
            title
          );
          setNewConversation(updatedConversation);
        } catch (error) {
          console.error("Error updating conversation title:", error);
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
      console.error("Chat error:", error);
      setStreamingMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    setMessages([]);
    setStreamingMessage(null);
    setError(null);
    setInputMessage("");
    setCurrentChatId(null);
    setSelectedModel(models[0].value);
    setWebSearchEnabled(false);
    setSidebarExpanded(false);
    setCurrentConversation(undefined);
    inputRef.current?.focus();
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      setCurrentChatId(chatId);
      await loadConversationMessages(chatId);
      setStreamingMessage(null);
      setError(null);
      setInputMessage("");
      setSidebarExpanded(false);
    } catch (error) {
      console.error("Error selecting chat:", error);
      setError("Failed to load selected conversation");
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

  // Update current conversation when a new one is created
  useEffect(() => {
    if (newConversation) {
      setCurrentConversation(newConversation);
    }
  }, [newConversation]);

  return (
    <div className="flex h-[calc(100dvh-1rem)] md:h-[calc(100dvh-6rem)]">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        expanded={sidebarExpanded}
        onToggle={toggleSidebar}
        newConversation={newConversation}
      />

      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        {currentChatId && messages.length > 0 && (
          <Navbar className="bg-transparent" isBlurred>
            <NavbarContent className="flex sm:justify-center">
              <div className="sm:hidden">
                <Button
                  isIconOnly
                  variant="ghost"
                  radius="full"
                  onPress={toggleSidebar}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <NavbarBrand className="hidden sm:flex">
                <p className="text-lg font-bold text-center w-full">
                  {currentConversation?.title || "Conversation"}
                </p>
              </NavbarBrand>
            </NavbarContent>
          </Navbar>
        )}

        {/* Show menu button for mobile when no navbar */}
        {(!currentChatId || messages.length === 0) && (
          <div className="sm:hidden absolute top-4 left-4 z-10">
            <Button
              isIconOnly
              variant="ghost"
              radius="full"
              onPress={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loadingConversation ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
          ) : messages.length === 0 ? (
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
