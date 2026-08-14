import type { Metadata } from "next";

import { PasswordResetForm } from "@/components/auth/password-reset-form";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Forgot Password | Icc Trading",
  description: "Reset your Icc Trading account password with an email code.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <SiteNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:bg-[#150e2e]/85">
          <CardHeader className="space-y-2 px-8 pt-8">
            <CardTitle className="text-3xl">Reset password</CardTitle>
            <CardDescription className="text-base">
              Enter your email and use the reset code sent to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <PasswordResetForm />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
