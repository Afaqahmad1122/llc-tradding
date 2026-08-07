import { DashboardOrders } from "@/components/dashboard/dashboard-orders";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardOrdersPage() {
  return (
    <UserDashboardShell
      activeSection="orders"
      title="My orders"
      description="Review every car linked to your account with payment, route, ETA, and export progress."
    >
      <DashboardOrders />
    </UserDashboardShell>
  );
}
