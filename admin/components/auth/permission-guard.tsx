"use client";

import { ShieldX } from "lucide-react";
import type { ReactNode } from "react";

import type { StaffPermissions } from "@/lib/api/auth";
import { useAdminAuthStore } from "@/stores/auth-store";

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-2xl">
        <ShieldX className="size-8" />
      </div>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          You don&apos;t have permission to view this section. Contact your
          administrator to request access.
        </p>
      </div>
    </div>
  );
}

type PermissionGuardProps = {
  permissionKey: keyof StaffPermissions;
  children: ReactNode;
};

export function PermissionGuard({ permissionKey, children }: PermissionGuardProps) {
  const hasPermission = useAdminAuthStore((state) => state.hasPermission);

  if (!hasPermission(permissionKey)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
