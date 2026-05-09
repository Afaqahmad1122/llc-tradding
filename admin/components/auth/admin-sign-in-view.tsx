"use client";

import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAdminLoginMutation } from "@/hooks/use-admin-login-mutation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/stores/auth-store";

const ADMIN_HOME = "/dashboard";

function isDashboardSignedIn(role: string | undefined): boolean {
  return role === "ADMIN" || role === "STAFF";
}

export function AdminSignInView() {
  const router = useRouter();
  const hasBootstrapped = useAdminAuthStore((s) => s.hasBootstrapped);
  const user = useAdminAuthStore((s) => s.user);
  const loginMutation = useAdminLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (isDashboardSignedIn(user?.role)) {
      router.replace(ADMIN_HOME);
    }
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-muted/20 p-6">
        <Spinner className="size-9 text-muted-foreground" aria-hidden />
        <p className="text-muted-foreground text-sm">Checking session…</p>
      </div>
    );
  }

  if (isDashboardSignedIn(user?.role)) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted/20 p-6">
        <Spinner className="size-9 text-muted-foreground" aria-hidden />
      </div>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div
      className={cn(
        "relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-6",
        "bg-[radial-gradient(at_75%_-12%,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_55%),radial-gradient(at_-8%_92%,color-mix(in_oklch,var(--primary)_8%,transparent),transparent_52%),linear-gradient(to_bottom_right,color-mix(in_oklch,var(--muted)_45%,transparent),var(--background)_40%,color-mix(in_oklch,var(--muted)_32%,transparent))]",
      )}
    >
      <div className="absolute inset-e-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <Card className="relative w-full max-w-md shadow-lg ring-foreground/10">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20 dark:bg-primary/15">
            <ShieldCheckIcon
              className="size-6"
              aria-hidden
              strokeWidth={1.75}
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Admin sign in
            </CardTitle>
            <CardDescription className="text-pretty leading-relaxed">
              Sign in with an administrator account. Self-service signup is not
              available for this dashboard.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={onSubmit} className="space-y-6">
            <FieldGroup className="gap-5">
              <Field>
                <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  required
                  disabled={loginMutation.isPending}
                  className={
                    loginMutation.isError
                      ? "border-destructive/80 aria-invalid:border-destructive"
                      : undefined
                  }
                  aria-invalid={loginMutation.isError}
                />
              </Field>
              <Field data-invalid={loginMutation.isError ? true : undefined}>
                <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                    required
                    disabled={loginMutation.isPending}
                    className={cn(
                      "pe-10",
                      loginMutation.isError &&
                        "border-destructive/80 aria-invalid:border-destructive",
                    )}
                    aria-invalid={loginMutation.isError}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={loginMutation.isPending}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-e-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden />
                    )}
                  </Button>
                </div>
                {loginMutation.isError ? (
                  <FieldError>{loginMutation.error.message}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              className="h-10 w-full gap-2 shadow-xs"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Spinner className="size-4" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
