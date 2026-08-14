"use client";

import type { FormEvent } from "react";
import { EyeIcon, EyeOffIcon, ShieldCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAdminLoginMutation } from "@/hooks/use-admin-login-mutation";
import { useApiMutation } from "@/hooks/use-api-mutation";
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
import {
  forgotPasswordApi,
  resetPasswordApi,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/stores/auth-store";

const ADMIN_HOME = "/dashboard";
type AuthView = "sign-in" | "reset-request" | "reset-confirm";

function isDashboardSignedIn(role: string | undefined): boolean {
  return role === "ADMIN" || role === "STAFF";
}

export function AdminSignInView() {
  const router = useRouter();
  const hasBootstrapped = useAdminAuthStore((s) => s.hasBootstrapped);
  const user = useAdminAuthStore((s) => s.user);
  const loginMutation = useAdminLoginMutation();
  const forgotPasswordMutation = useApiMutation({
    mutationFn: (payload: ForgotPasswordRequest) => forgotPasswordApi(payload),
    successToast: "If the account exists, a reset code has been sent.",
    errorToast: () => null,
  });
  const resetPasswordMutation = useApiMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPasswordApi(payload),
    successToast: "Password reset successfully. Please sign in.",
    errorToast: () => null,
  });
  const [view, setView] = useState<AuthView>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const onResetRequest = async (e: FormEvent) => {
    e.preventDefault();
    setResetError(null);
    const normalizedEmail = resetEmail.trim();
    try {
      await forgotPasswordMutation.mutateAsync({ email: normalizedEmail });
      setResetEmail(normalizedEmail);
      setView("reset-confirm");
    } catch (error) {
      setResetError(
        error instanceof Error ? error.message : "Unable to send reset code",
      );
    }
  };

  const onPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setResetError(null);
    try {
      await resetPasswordMutation.mutateAsync({
        email: resetEmail.trim(),
        otp: resetOtp.trim(),
        newPassword,
        confirmNewPassword,
      });
      setPassword("");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setEmail(resetEmail.trim());
      setView("sign-in");
    } catch (error) {
      setResetError(
        error instanceof Error ? error.message : "Unable to reset password",
      );
    }
  };

  const showSignIn = () => {
    setResetError(null);
    setView("sign-in");
  };

  const cardTitle =
    view === "sign-in"
      ? "Admin sign in"
      : view === "reset-request"
        ? "Reset password"
        : "Enter reset code";
  const cardDescription =
    view === "sign-in"
      ? "Sign in with an administrator account. Self-service signup is not available for this dashboard."
      : view === "reset-request"
        ? "Enter your dashboard account email and we will send a reset code."
        : "Use the code from your email and choose a new password.";

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
              {cardTitle}
            </CardTitle>
            <CardDescription className="text-pretty leading-relaxed">
              {cardDescription}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {view === "sign-in" ? (
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
            <div className="-mt-3 flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-sm"
                disabled={loginMutation.isPending}
                onClick={() => {
                  setResetEmail(email.trim());
                  setResetError(null);
                  setView("reset-request");
                }}
              >
                Forgot password?
              </Button>
            </div>
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
          ) : view === "reset-request" ? (
            <form onSubmit={onResetRequest} className="space-y-6">
              <FieldGroup className="gap-5">
                <Field data-invalid={Boolean(resetError) || undefined}>
                  <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="you@company.com"
                    value={resetEmail}
                    onChange={(ev) => setResetEmail(ev.target.value)}
                    required
                    disabled={forgotPasswordMutation.isPending}
                    aria-invalid={Boolean(resetError)}
                    className={
                      resetError
                        ? "border-destructive/80 aria-invalid:border-destructive"
                        : undefined
                    }
                  />
                  {resetError ? <FieldError>{resetError}</FieldError> : null}
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                className="h-10 w-full gap-2 shadow-xs"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <>
                    <Spinner className="size-4" />
                    Sending code…
                  </>
                ) : (
                  "Send reset code"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full"
                disabled={forgotPasswordMutation.isPending}
                onClick={showSignIn}
              >
                Back to sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={onPasswordReset} className="space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                If the account exists, a reset code has been sent to your email.
              </div>
              <FieldGroup className="gap-5">
                <Field>
                  <FieldLabel htmlFor="reset-confirm-email">Email</FieldLabel>
                  <Input
                    id="reset-confirm-email"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(ev) => setResetEmail(ev.target.value)}
                    required
                    disabled={resetPasswordMutation.isPending}
                  />
                </Field>
                <Field data-invalid={Boolean(resetError) || undefined}>
                  <FieldLabel htmlFor="reset-otp">Reset code</FieldLabel>
                  <Input
                    id="reset-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit code"
                    value={resetOtp}
                    onChange={(ev) => setResetOtp(ev.target.value)}
                    required
                    disabled={resetPasswordMutation.isPending}
                    aria-invalid={Boolean(resetError)}
                    className={
                      resetError
                        ? "border-destructive/80 aria-invalid:border-destructive"
                        : undefined
                    }
                  />
                  {resetError ? <FieldError>{resetError}</FieldError> : null}
                </Field>
                <Field>
                  <FieldLabel htmlFor="new-password">New password</FieldLabel>
                  <AdminPasswordInput
                    id="new-password"
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                    showPassword={showNewPassword}
                    onToggle={() => setShowNewPassword((v) => !v)}
                    disabled={resetPasswordMutation.isPending}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-new-password">
                    Confirm new password
                  </FieldLabel>
                  <AdminPasswordInput
                    id="confirm-new-password"
                    value={confirmNewPassword}
                    onChange={setConfirmNewPassword}
                    autoComplete="new-password"
                    showPassword={showConfirmNewPassword}
                    onToggle={() => setShowConfirmNewPassword((v) => !v)}
                    disabled={resetPasswordMutation.isPending}
                  />
                </Field>
              </FieldGroup>
              <Button
                type="submit"
                className="h-10 w-full gap-2 shadow-xs"
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Spinner className="size-4" />
                    Resetting…
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full"
                disabled={resetPasswordMutation.isPending}
                onClick={() => {
                  setResetError(null);
                  setView("reset-request");
                }}
              >
                Use a different email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminPasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  showPassword,
  onToggle,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  showPassword: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        required
        disabled={disabled}
        className="pe-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        onClick={onToggle}
        className="absolute inset-e-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {showPassword ? (
          <EyeOffIcon className="size-4" aria-hidden />
        ) : (
          <EyeIcon className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}
