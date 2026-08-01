"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { AdminCarEventAlerts } from "@/components/providers/admin-car-event-alerts";
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
        storageKey="admin-theme"
        disableTransitionOnChange
      >
        <AdminSessionProvider>
          <AdminCarEventAlerts />
          {children}
        </AdminSessionProvider>
        <Toaster position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  );
}
