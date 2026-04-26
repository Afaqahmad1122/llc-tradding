import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Sign Up | Icc Trading",
  description: "Create your Icc Trading account.",
};

export default function SignupPage() {
  return (
    <AuthPage
      title="Create your account"
      description="Join Icc Trading to request quotes and track your vehicle inquiries."
      submitLabel="Create account"
      fields={[
        {
          id: "fullName",
          label: "Full name",
          type: "text",
          autoComplete: "name",
          placeholder: "Your full name",
        },
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
          autoComplete: "new-password",
          placeholder: "Create a strong password",
        },
        {
          id: "confirmPassword",
          label: "Confirm password",
          type: "password",
          autoComplete: "new-password",
          placeholder: "Re-enter your password",
        },
      ]}
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    />
  );
}
