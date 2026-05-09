"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { useAdminAuthStore } from "@/stores/auth-store";

type AdminAuthGuardProps = {
  children: ReactNode;
};

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();
  const user = useAdminAuthStore((state) => state.user);
  const hasBootstrapped = useAdminAuthStore((state) => state.hasBootstrapped);

  const isAllowed = user?.role === "ADMIN" || user?.role === "STAFF";

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (!isAllowed) {
      router.replace("/");
    }
  }, [hasBootstrapped, router, isAllowed]);

  if (!hasBootstrapped) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
