"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Divider, ScrollShadow } from "@heroui/react";
import { Plus, MessageSquare, X, Menu, MessageCircle } from "lucide-react";
import Image from "next/image";
import { chatService, Conversation } from "@/services/api";

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId: string | null;
  expanded: boolean;
  onToggle: () => void;
  newConversation?: Conversation; // New prop to receive a newly created conversation
}

export function Sidebar({
  onNewChat,
  onSelectChat,
  currentChatId,
  expanded,
  onToggle,
  newConversation,
}: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a fetchConversations function that can be called when needed
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getConversations(10); // Get the latest 10 conversations
      setConversations(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
      console.error("Error loading conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load conversations from API on mount
  useEffect(() => {
    fetchConversations();

    return () => {
      setConversations([]);
    };
  }, [fetchConversations]);

  // Handle new conversation added via props
  useEffect(() => {
    if (newConversation) {
      // Check if the conversation already exists in our list
      const exists = conversations.some(
        (conv) => conv.id === newConversation.id
      );

      if (!exists) {
        // Add the new conversation to the beginning of the list
        setConversations((prev) => [newConversation, ...prev]);
      } else {
        // Update the existing conversation (like its title)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === newConversation.id ? newConversation : conv
          )
        );
      }
    }
  }, [newConversation]);

  // Collapsed sidebar view
  if (!expanded) {
    return (
      <div className="hidden md:flex flex-col h-full w-16 border-r border-gray-200 dark:border-gray-800 bg-background/60 backdrop-blur-md items-center">
        <div className="flex flex-col h-full items-center justify-start gap-8 py-6">
          <div>
            <Button isIconOnly variant="ghost" radius="full" onPress={onToggle}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col items-start gap-8">
            <Button
              isIconOnly
              variant="ghost"
              radius="full"
              className=" shadow-md"
              onPress={onNewChat}
            >
              <Plus className="h-5 w-5" />
            </Button>

            <Button
              isIconOnly
              variant="ghost"
              radius="full"
              className="text-gray-500"
              onPress={() =>
                conversations.length > 0 && onSelectChat(conversations[0].id)
              }
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>

          <div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              T
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Expanded sidebar view - as an overlay
  return (
    <>
      {/* Backdrop overlay */}
      <Button
        isIconOnly
        variant="ghost"
        radius="full"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
        onPress={onToggle}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <div className="flex flex-col h-full w-64 border-r border-gray-200 dark:border-gray-800 bg-background/95 backdrop-blur-md fixed left-0 top-0 bottom-0 z-40 shadow-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/one-ai-favicon.svg"
              alt="OneAI"
              width={24}
              height={24}
            />
            <span className="font-bold text-lg">OneAI</span>
          </div>
          <Button
            isIconOnly
            variant="ghost"
            radius="full"
            size="sm"
            onPress={onToggle}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-3 py-2">
          <Button
            variant="flat"
            className="w-full justify-start gap-2 rounded-lg"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onNewChat}
          >
            New chat
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="px-4 py-2 text-sm text-red-500">{error}</div>
        ) : conversations.length > 0 ? (
          <>
            <Divider className="my-2" />
            <div className="px-4 py-1">
              <p className="text-sm text-gray-500 font-medium">Recents</p>
            </div>

            <ScrollShadow className="flex-1 overflow-y-auto">
              <div className="px-2 py-1 space-y-1">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={
                      currentChatId === conversation.id ? "flat" : "ghost"
                    }
                    color={
                      currentChatId === conversation.id ? "primary" : "default"
                    }
                    className="w-full justify-start text-xs text-left h-auto py-2 px-3 rounded-lg border-1"
                    startContent={
                      <MessageSquare className="h-4 w-4 shrink-0" />
                    }
                    onPress={() => onSelectChat(conversation.id)}
                  >
                    <div className="truncate w-full text-default-500">
                      {conversation.title}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollShadow>
          </>
        ) : (
          <div className="px-4 py-2 text-sm text-gray-500">
            No conversations yet
          </div>
        )}

        <div className="mt-auto p-3">
          <div className="flex items-center gap-2 py-2 px-3 text-sm rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
              {/* User initials or avatar could go here */}T
            </div>
            <span className="truncate">Free plan</span>
          </div>
        </div>
      </div>
    </>
  );
}
