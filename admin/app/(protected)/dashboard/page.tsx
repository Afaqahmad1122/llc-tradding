"use client";

import { useAdminLogoutMutation } from "@/hooks/use-admin-logout-mutation";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const logout = useAdminLogoutMutation();

  return (
    <div className="flex min-h-svh flex-col gap-8 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            You are signed in as an administrator.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={logout.isPending}
          onClick={() => logout.mutate(undefined)}
        >
          Sign out
        </Button>
      </header>
      <main className="flex flex-1 items-start rounded-lg border bg-card p-6 text-sm text-muted-foreground shadow-xs ring-1 ring-foreground/10">
        Protected admin area — add navigation and screens here.
      </main>
    </div>
  );
}
