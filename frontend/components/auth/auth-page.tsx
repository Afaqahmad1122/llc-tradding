import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { AuthForm } from "@/components/auth/auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AuthField = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder: string;
};

type AuthPageProps = {
  mode: "login" | "signup" | "verify";
  title: string;
  description: string;
  submitLabel: string;
  fields: AuthField[];
  initialValues?: Partial<Record<string, string>>;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  extraFooter?: ReactNode;
};

export function AuthPage({
  mode,
  title,
  description,
  submitLabel,
  fields,
  initialValues,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  extraFooter,
}: AuthPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <SiteNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:bg-[#150e2e]/85">
          <CardHeader className="space-y-2 px-8 pt-8">
            <CardTitle className="text-3xl">{title}</CardTitle>
            <CardDescription className="text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <AuthForm
              mode={mode}
              fields={fields}
              submitLabel={submitLabel}
              initialValues={initialValues}
            />
            <div className="mt-6 space-y-2 text-center text-base text-muted-foreground">
              <p>
                {footerText}{" "}
                <Link href={footerLinkHref} className="font-medium text-primary hover:underline">
                  {footerLinkLabel}
                </Link>
              </p>
              {extraFooter}
            </div>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
