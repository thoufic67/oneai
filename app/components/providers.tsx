"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./theme-provider";
import { ShortcutKeyProvider } from "./search/ShortcutKeyProvider";
import { AuthProvider } from "./auth-provider";
import { PostHogProvider } from "./PostHogProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <PostHogProvider>
        <HeroUIProvider>
          <AuthProvider>
            <ShortcutKeyProvider>{children}</ShortcutKeyProvider>
          </AuthProvider>
        </HeroUIProvider>
      </PostHogProvider>
    </ThemeProvider>
  );
}
