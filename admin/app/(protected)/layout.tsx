import type { ReactNode } from "react";

import { AdminAuthGuard } from "@/components/auth/admin-auth-guard";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
