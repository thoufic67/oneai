"use client";

import { useState, useEffect } from "react";
import { Button, Divider, ScrollShadow } from "@heroui/react";
import { Plus, MessageSquare, X, Menu, MessageCircle } from "lucide-react";
import Image from "next/image";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  currentChatId: string | null;
  expanded: boolean;
  onToggle: () => void;
}

export function Sidebar({
  onNewChat,
  onSelectChat,
  currentChatId,
  expanded,
  onToggle,
}: SidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("oneai-chat-history");
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        // Convert to ChatHistory format for sidebar display
        const formattedChats = parsedChats
          .map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            timestamp: chat.timestamp,
          }))
          .sort((a: ChatHistory, b: ChatHistory) => b.timestamp - a.timestamp);

        setChatHistory(formattedChats);
      } catch (error) {
        console.error("Error parsing chat history:", error);
      }
    }
  }, []);

  // Collapsed sidebar view
  if (!expanded) {
    return (
      <div className="flex flex-col h-full w-16 border-r border-gray-200 dark:border-gray-800 bg-background/60 backdrop-blur-md items-center">
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
                chatHistory.length > 0 && onSelectChat(chatHistory[0].id)
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
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
        onClick={onToggle}
      />

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
            radius="lg"
            className="w-full justify-start gap-2"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onNewChat}
          >
            New chat
          </Button>
        </div>

        {chatHistory.length > 0 && (
          <>
            <Divider className="my-2" />
            <div className="px-4 py-1">
              <p className="text-sm text-gray-500 font-medium">Recents</p>
            </div>

            <ScrollShadow className="flex-1 overflow-y-auto">
              <div className="px-2 py-1 space-y-1">
                {chatHistory.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChatId === chat.id ? "flat" : "ghost"}
                    radius="lg"
                    className="w-full justify-start text-sm text-left h-auto py-2 px-3"
                    startContent={
                      <MessageSquare className="h-4 w-4 shrink-0" />
                    }
                    onPress={() => onSelectChat(chat.id)}
                  >
                    <div className="truncate w-full">{chat.title}</div>
                  </Button>
                ))}
              </div>
            </ScrollShadow>
          </>
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
