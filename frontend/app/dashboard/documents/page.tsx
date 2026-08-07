import { DashboardDocuments } from "@/components/dashboard/dashboard-documents";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardDocumentsPage() {
  return (
    <UserDashboardShell
      activeSection="documents"
      title="Documents"
      description="Access invoices, inspection sheets, export certificates, and shipment files as soon as admin publishes them."
    >
      <DashboardDocuments />
    </UserDashboardShell>
  );
}
