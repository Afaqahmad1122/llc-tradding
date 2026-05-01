"use client";

import { useEffect, type ReactNode } from "react";

import { refreshSessionApi } from "@/lib/api/auth";
import { useAdminAuthStore } from "@/stores/auth-store";

type AdminSessionProviderProps = {
  children: ReactNode;
};

export function AdminSessionProvider({ children }: AdminSessionProviderProps) {
  const setAuthSession = useAdminAuthStore((state) => state.setAuthSession);
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);
  const setBootstrapped = useAdminAuthStore((state) => state.setBootstrapped);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const response = await refreshSessionApi();
        if (!isMounted) {
          return;
        }
        if (response.user.role !== "ADMIN") {
          clearAuth();
          return;
        }
        setAuthSession(response.user, response.accessToken);
      } catch {
        if (!isMounted) {
          return;
        }
        clearAuth();
      } finally {
        if (!isMounted) {
          return;
        }
        setBootstrapped(true);
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuthSession, setBootstrapped]);

  return <>{children}</>;
}
