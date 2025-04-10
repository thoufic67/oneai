"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./theme-provider";
import { ShortcutKeyProvider } from "./search/ShortcutKeyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <ShortcutKeyProvider>{children}</ShortcutKeyProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
