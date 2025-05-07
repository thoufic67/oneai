/**
 * Share button component for conversations
 * Opens a modal with sharing options and checks for existing share links
 * Uses native Web Share API for sharing capabilities
 */

"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Share, Share2 } from "lucide-react";
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
import { Code } from "@heroui/code";

interface ShareButtonProps {
  conversationId: string;
}

export function ShareButton({ conversationId }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
      setIsDeleting(true);
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
      setIsDeleting(false);
    }
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;

    try {
      await navigator.share({
        title: "Shared Conversation",
        text: "Check out this Aiflo conversation!",
        url: shareUrl,
      });
      toast.success("Successfully shared!");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Failed to share");
        console.error("Share error:", error);
      }
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
        // className="max-w-full"
        size="md"
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
                  onPress={handleShare}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Creating link..." : "Generate share link"}
                </Button>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Code
                      radius="lg"
                      className="flex-1 px-3 py-2 border bg-muted max-w-full overflow-x-auto"
                    >
                      {shareUrl}
                    </Code>
                    <Button
                      isIconOnly
                      onPress={() => {
                        handleCopy();
                        setCopied(true);
                        setTimeout(() => setCopied(false), 3000);
                      }}
                      variant="flat"
                      className="text-primary"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {typeof navigator !== "undefined" &&
                      "share" in navigator && (
                        <Button
                          isIconOnly
                          onPress={handleNativeShare}
                          variant="flat"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
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
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete share link"}
              </Button>
              <Button variant="bordered" onPress={() => setIsOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
