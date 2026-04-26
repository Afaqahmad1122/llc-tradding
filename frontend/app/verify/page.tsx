import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = {
  title: "Verify Email | Icc Trading",
  description: "Verify your email with the OTP code sent to your inbox.",
};

type VerifyPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const email = params.email?.trim() ?? "";

  return (
    <AuthPage
      mode="verify"
      title="Verify your email"
      description="Enter the OTP code sent to your email address."
      submitLabel="Verify code"
      initialValues={{
        email,
      }}
      fields={[
        {
          id: "email",
          label: "Email",
          type: "email",
          autoComplete: "email",
          placeholder: "you@company.com",
        },
        {
          id: "otp",
          label: "OTP code",
          type: "text",
          autoComplete: "one-time-code",
          placeholder: "Enter 6-digit code",
        },
      ]}
      footerText="Already verified?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    />
  );
}
