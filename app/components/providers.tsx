"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./theme-provider";
import { ShortcutKeyProvider } from "./search/ShortcutKeyProvider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <HeroUIProvider>
        <AuthProvider>
          <ShortcutKeyProvider>{children}</ShortcutKeyProvider>
        </AuthProvider>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
