import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardPage() {
  return (
    <UserDashboardShell
      activeSection="overview"
      title="Dashboard overview"
      description="Track your active car orders, shipment movement, payment status, and next action from one place."
    >
      <DashboardOverview />
    </UserDashboardShell>
  );
}
