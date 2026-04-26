"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";

type AuthPageSessionGuardProps = {
  children: ReactNode;
};

export function AuthPageSessionGuard({ children }: AuthPageSessionGuardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  useEffect(() => {
    if (!hasBootstrapped || !user) {
      return;
    }
    router.replace("/");
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped) {
    return null;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
