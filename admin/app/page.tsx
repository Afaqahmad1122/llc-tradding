import type { Metadata } from "next";

import { AdminSignInView } from "@/components/auth/admin-sign-in-view";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function AdminSignInPage() {
  return <AdminSignInView />;
}
