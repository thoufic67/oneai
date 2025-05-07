"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Command } from "cmdk";
import {
  Search,
  Plus,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { chatService, Conversation } from "@/services/api";
import { Modal, ModalContent } from "@heroui/react";
import { cn } from "@/lib/utils";
import "./command-menu.css";
import { BackgroundGradient } from "../background-gradient";

interface CommandKProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentChatId?: string;
}

export function CommandK({
  isOpen,
  onOpenChange,
  currentChatId,
}: CommandKProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch conversations when the modal opens
  const fetchConversations = useCallback(async () => {
    if (!isOpen) return;

    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const data = await chatService.getConversations({ limit: 15 });
      setConversations(data.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load chat history";
      setHistoryError(errorMessage);
      console.error("Error loading conversations:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Focus the input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is mounted
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSelectChat = (chatId: string) => {
    console.log("handleSelectChat", chatId);
    onOpenChange(false);
    router.push(`/c/${chatId}`);
  };

  const handleNewChat = () => {
    router.push("/new");
    onOpenChange(false);
  };

  const runCommand = useCallback(
    (command: () => unknown) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conversation) =>
      !search ||
      (conversation.title || "Untitled Conversation")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      placement="top-center"
      size="xl"
      classNames={{
        base: "command-dialog",
        backdrop: "bg-black/50",
      }}
    >
      <ModalContent>
        <div className="command-dialog-content">
          <Command value={search} onValueChange={setSearch}>
            <div className="command-input">
              <Search className="h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                ref={inputRef}
                placeholder="Type a command or search..."
                className="placeholder:text-gray-500"
              />
            </div>
            <Command.List>
              <Command.Empty className="command-empty">
                No results found.
              </Command.Empty>

              {/* Always show Navigation group unless filtered out by search */}
              <Command.Group heading="Navigation" className="command-group">
                <Command.Item
                  className="command-item"
                  onSelect={() => runCommand(() => router.push("/new"))}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                  <div className="command-shortcut">⌘H</div>
                </Command.Item>
                {currentChatId && (
                  <Command.Item
                    className="command-item"
                    onSelect={() =>
                      runCommand(() => router.push(`/c/${currentChatId}`))
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Current Chat
                    <div className="command-shortcut">⌘C</div>
                  </Command.Item>
                )}
              </Command.Group>

              <Command.Separator className="command-separator" />

              {/* Always show Actions group unless filtered out by search */}
              <Command.Group heading="Actions" className="command-group">
                <Command.Item className="command-item" onSelect={handleNewChat}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Chat
                  <div className="command-shortcut">⌘N</div>
                </Command.Item>
              </Command.Group>

              <Command.Separator className="command-separator" />

              {/* Show conversations group if there are conversations or loading */}
              <Command.Group
                heading="Recent Conversations"
                className="command-group"
              >
                {loadingHistory && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  </div>
                )}
                {historyError && (
                  <div className="py-4 text-center text-sm text-red-500">
                    {historyError}
                  </div>
                )}
                {!loadingHistory &&
                  !historyError &&
                  conversations.map((conversation) => (
                    <Command.Item
                      key={conversation.id}
                      className="command-item"
                      onSelect={() => handleSelectChat(conversation.id)}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4 min-w-4 min-h-4" />
                          <p className="max-w-md truncate">
                            {conversation.title || "Untitled Conversation"}
                          </p>
                        </div>
                        <div className="command-shortcut">
                          {new Date(
                            conversation.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </Command.Item>
                  ))}
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </ModalContent>
    </Modal>
  );
}
