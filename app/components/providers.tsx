"use client";

import * as React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <HeroUIProvider>{children}</HeroUIProvider>
    </ThemeProvider>
  );
}
