import { DashboardPayments } from "@/components/dashboard/dashboard-payments";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardPaymentsPage() {
  return (
    <UserDashboardShell
      activeSection="payments"
      title="Payments"
      description="Review how much you've paid, what's outstanding, and every transaction on your orders."
    >
      <DashboardPayments />
    </UserDashboardShell>
  );
}
