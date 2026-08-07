import { DashboardShipments } from "@/components/dashboard/dashboard-shipments";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardShipmentsPage() {
  return (
    <UserDashboardShell
      activeSection="shipments"
      title="Shipment tracking"
      description="Follow vessel movement, ETA, port details, and the export timeline for your active shipment."
    >
      <DashboardShipments />
    </UserDashboardShell>
  );
}
