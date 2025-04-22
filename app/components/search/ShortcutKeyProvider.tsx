"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CommandK } from "./CommandK";
import { useParams } from "next/navigation";

interface ShortcutKeyContextType {
  openCommandK: () => void;
  closeCommandK: () => void;
  isCommandKOpen: boolean;
}

const ShortcutKeyContext = createContext<ShortcutKeyContextType>({
  openCommandK: () => {},
  closeCommandK: () => {},
  isCommandKOpen: false,
});

export const useShortcutKey = () => useContext(ShortcutKeyContext);

export function ShortcutKeyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);
  const params = useParams();
  const currentChatId = params?.id as string | undefined;

  const openCommandK = () => setIsCommandKOpen(true);
  const closeCommandK = () => setIsCommandKOpen(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Command+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsCommandKOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ShortcutKeyContext.Provider
      value={{ openCommandK, closeCommandK, isCommandKOpen }}
    >
      {children}
      <CommandK
        isOpen={isCommandKOpen}
        onOpenChange={setIsCommandKOpen}
        currentChatId={currentChatId}
      />
    </ShortcutKeyContext.Provider>
  );
}
