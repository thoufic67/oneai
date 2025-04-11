"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, ModalContent, Button, Input } from "@heroui/react";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface CommandKProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandK({ isOpen, onClose }: CommandKProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleNewChat = () => {
    router.push("/new");
    onClose();
  };

  return (
    <Modal backdrop="blur" hideCloseButton isOpen={isOpen} onClose={onClose}>
      <ModalContent className="max-w-md mx-auto p-0 overflow-hidden">
        <div className="p-2">
          <Input
            ref={inputRef}
            value={searchQuery}
            className="w-full"
            placeholder="Search for your tasks..."
            size="lg"
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            variant="bordered"
            onValueChange={setSearchQuery}
            aria-label="Search"
          />
        </div>

        <div className="p-2">
          <div className="text-sm text-gray-500 p-2">Type to search</div>

          <Button
            className="w-full justify-start text-left p-2 h-auto"
            variant="light"
            onPress={handleNewChat}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-gray-400 text-center">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">
              ⌘
            </kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800">
              K
            </kbd>{" "}
            to search
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
