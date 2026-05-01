import type { ReactNode } from "react";

import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
