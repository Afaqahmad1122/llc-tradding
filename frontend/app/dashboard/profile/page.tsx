import { DashboardProfile } from "@/components/dashboard/dashboard-profile";
import { UserDashboardShell } from "@/components/dashboard/user-dashboard-shell";

export default function DashboardProfilePage() {
  return (
    <UserDashboardShell
      activeSection="profile"
      title="Profile"
      description="Manage your customer account details inside the dashboard without leaving order tracking."
    >
      <DashboardProfile />
    </UserDashboardShell>
  );
}
