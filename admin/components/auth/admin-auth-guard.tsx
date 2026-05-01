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

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (!user || user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped) {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-svh flex-1 items-center justify-center">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
