import type { Metadata } from "next";
import Link from "next/link";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Login | Icc Trading",
  description: "Access your Icc Trading account.",
};

export default function LoginPage() {
  return (
    <AuthPage
      mode="login"
      title="Welcome back"
      description="Sign in to manage quotes, orders, and account activity."
      submitLabel="Sign in"
      fields={[
        {
          id: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "you@company.com",
        },
        {
          id: "password",
          label: "Password",
          type: "password",
          autoComplete: "current-password",
          placeholder: "Enter your password",
        },
      ]}
      footerText="Don't have an account?"
      footerLinkLabel="Create one"
      footerLinkHref="/signup"
      extraFooter={
        <Link href="/contact/connect-with-us" className="inline-block hover:underline">
          Need help signing in?
        </Link>
      }
    />
  );
}
