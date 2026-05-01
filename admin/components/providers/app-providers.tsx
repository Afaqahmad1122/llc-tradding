"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { AdminSessionProvider } from "@/components/providers/admin-session-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AdminSessionProvider>{children}</AdminSessionProvider>
        <Toaster />
      </ThemeProvider>
    </QueryProvider>
  );
}
