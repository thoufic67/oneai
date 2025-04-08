"use client";

import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { PlusCircle as PlusIcon } from "lucide-react";
import { ArrowUp as ArrowUpIcon } from "lucide-react";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

interface ChatInputProps {
  onSubmit?: (message: string) => void;
  disabled?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput({ onSubmit, disabled }, ref) {
    const [message, setMessage] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const handleSubmit = () => {
      if (message.trim() && onSubmit) {
        onSubmit(message);
        setMessage("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <div className="relative">
        <div className="relative rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="min-h-[100px] p-4">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="w-full border-0 bg-transparent p-0 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none min-h-[100px] resize-y"
              disabled={disabled}
              size="md"
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 p-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                disabled={disabled}
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
              <span className="text-sm text-gray-500">{message.length}</span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
            >
              <ArrowUpIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
