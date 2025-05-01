/**
 * Share button component for conversations
 * Opens a modal with sharing options and checks for existing share links
 */

"use client";

import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { ShareResponse } from "@/types/share";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShareButtonProps {
  conversationId: string;
}

export function ShareButton({ conversationId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const router = useRouter();

  // Check for existing share when modal opens
  const checkExistingShare = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/conversations/${conversationId}/share`,
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data: ShareResponse = await response.json();
        if (data.share_id) {
          setShareUrl(
            `${process.env.NEXT_PUBLIC_APP_URL}/share/${data.share_id}`
          );
        }
      }
    } catch (error) {
      console.error("Error checking existing share:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to check existing share when modal opens
  useEffect(() => {
    if (isOpen) {
      checkExistingShare();
    }
  }, [isOpen]);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/conversations/${conversationId}/share`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data: ShareResponse = await response.json();
      setShareUrl(data.share_url);
    } catch (error) {
      toast.error("Failed to create share link");
      console.error("Share error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard");
      } catch (error) {
        toast.error("Failed to copy link");
        console.error("Copy error:", error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/conversations/${conversationId}/share`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete share link");
      }

      setShareUrl(null);
      toast.success("Share link deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete share link");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        isIconOnly
        variant="bordered"
        size="sm"
        radius="full"
        onPress={() => setIsOpen(true)}
        title="Share conversation"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        backdrop="blur"
        hideCloseButton
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Share Conversation</h2>
            <p className="text-sm text-gray-500">
              {shareUrl
                ? "Share this conversation using the link below"
                : "Create a shareable link to this conversation"}
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              {!shareUrl ? (
                <Button
                  onClick={handleShare}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating link..." : "Generate share link"}
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-muted"
                    />
                    <Button onClick={handleCopy} variant="bordered">
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
          {shareUrl && (
            <ModalFooter>
              <Button
                onPress={handleDelete}
                variant="bordered"
                color="danger"
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete share link"}
              </Button>
              {/* <Button variant="bordered" onPress={() => setIsOpen(false)}>
              Close
            </Button>
            <Button variant="bordered" onPress={handleDelete}>
              Delete
            </Button> */}
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
