import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthField = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder: string;
};

type AuthPageProps = {
  title: string;
  description: string;
  submitLabel: string;
  fields: AuthField[];
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  extraFooter?: ReactNode;
};

export function AuthPage({
  title,
  description,
  submitLabel,
  fields,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  extraFooter,
}: AuthPageProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <SiteNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-[#452E5A]/15 bg-white/90 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:bg-[#150e2e]/85">
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" noValidate>
              {fields.map((field) => (
                <div className="space-y-2" key={field.id}>
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    name={field.id}
                    type={field.type}
                    autoComplete={field.autoComplete}
                    placeholder={field.placeholder}
                    required
                  />
                </div>
              ))}
              <Button type="submit" className="w-full">
                {submitLabel}
              </Button>
            </form>
            <div className="mt-4 space-y-2 text-center text-sm text-muted-foreground">
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
