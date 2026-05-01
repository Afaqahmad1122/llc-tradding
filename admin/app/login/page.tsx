import type { Metadata } from "next";

import { AdminLoginView } from "./admin-login-view";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return <AdminLoginView />;
}
