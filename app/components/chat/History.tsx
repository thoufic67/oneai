"use client";

/**
 * History Component
 *
 * Renders a modal dialog displaying the user's recent chat conversations.
 * Allows users to select a conversation to navigate to.
 */
import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Divider,
  Listbox,
  ListboxItem,
} from "@heroui/react";
import { MessageSquare } from "lucide-react";
import { chatService, Conversation } from "@/services/api";
import { useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link";

interface HistoryProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentChatId: string | null;
}

export function History({ isOpen, onOpenChange, currentChatId }: HistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter

  // Fetch conversations when the modal opens
  const fetchConversations = useCallback(async () => {
    if (!isOpen) return; // Don't fetch if modal is closed

    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const data = await chatService.getConversations({ limit: 20 }); // Get recent conversations
      setConversations(data.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);
      console.error("Error loading conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen]); // Re-run when isOpen changes

  // Load conversations when the modal becomes visible
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    onOpenChange(false); // Close the modal
    router.push(`/c/${chatId}`); // Navigate to the selected chat
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      scrollBehavior="inside"
      size="xl" // Adjust size as needed
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Chat History
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="px-4 py-2 text-sm text-red-500">{error}</div>
              ) : conversations?.length > 0 ? (
                <ScrollShadow className="w-full h-[400px]">
                  <Listbox
                    aria-label="Chat History"
                    variant="flat"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={currentChatId ? [currentChatId] : []}
                    onAction={(key) => handleSelectChat(key as string)}
                  >
                    {conversations.map((conversation) => (
                      <ListboxItem
                        key={conversation.id}
                        textValue={conversation.title} // For accessibility and filtering if added later
                        startContent={
                          <MessageSquare className="h-4 w-4 shrink-0 mr-2 text-default-500" />
                        }
                        className="text-left rounded-lg"
                      >
                        <div className="truncate w-full text-default-700">
                          {conversation.title ||
                            `Conversation ${conversation.id.substring(0, 6)}`}
                        </div>
                      </ListboxItem>
                    ))}
                  </Listbox>
                </ScrollShadow>
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No conversations yet. Start a new chat!
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
