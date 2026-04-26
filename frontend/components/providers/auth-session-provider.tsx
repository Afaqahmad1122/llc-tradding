"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { refreshSessionApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type AuthSessionProviderProps = {
  children: ReactNode;
};

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      try {
        const response = await refreshSessionApi();
        if (!isMounted) {
          return;
        }
        setAuthUser(response.user);
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
  }, [clearAuth, setAuthUser, setBootstrapped]);

  return <>{children}</>;
}
