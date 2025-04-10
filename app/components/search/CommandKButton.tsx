"use client";

import { Button } from "@heroui/react";
import { Search } from "lucide-react";
import { useShortcutKey } from "./ShortcutKeyProvider";

interface CommandKButtonProps {
  className?: string;
}

export function CommandKButton({ className = "" }: CommandKButtonProps) {
  const { openCommandK } = useShortcutKey();

  return (
    <Button
      variant="ghost"
      className={`flex items-center gap-2 ${className}`}
      onPress={openCommandK}
    >
      <Search className="h-4 w-4" />
      <span>Search</span>
      <kbd className="px-1 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-800 hidden sm:inline-block">
        ⌘K
      </kbd>
    </Button>
  );
}
