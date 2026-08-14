"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/hooks/use-forgot-password-mutation";
import { useResetPasswordMutation } from "@/hooks/use-reset-password-mutation";
import { ApiError } from "@/lib/api";

type ResetStep = "request" | "reset";

export function PasswordResetForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPending =
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

  const requestResetCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const nextEmail = String(formData.get("email") ?? "").trim();

    try {
      await forgotPasswordMutation.mutateAsync({ email: nextEmail });
      setEmail(nextEmail);
      setStep("reset");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Unable to send reset code";
      setErrorMessage(message);
    }
  };

  const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const resetEmail = String(formData.get("email") ?? "").trim();
    const otp = String(formData.get("otp") ?? "").trim();
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmNewPassword = String(
      formData.get("confirmNewPassword") ?? "",
    );

    try {
      await resetPasswordMutation.mutateAsync({
        email: resetEmail,
        otp,
        newPassword,
        confirmNewPassword,
      });
      router.push("/login?reset=1");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to reset password";
      setErrorMessage(message);
    }
  };

  if (step === "reset") {
    return (
      <form className="space-y-5" noValidate onSubmit={resetPassword}>
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          If the account exists, a reset code has been sent to your email.
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-base">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 text-base"
            required
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="otp" className="text-base">
            Reset code
          </Label>
          <Input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Enter 6-digit code"
            className="h-12 text-base"
            required
          />
        </div>
        <PasswordField
          id="newPassword"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          showPassword={showNewPassword}
          onToggle={() => setShowNewPassword((value) => !value)}
        />
        <PasswordField
          id="confirmNewPassword"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter new password"
          showPassword={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
        />
        <Button type="submit" className="h-12 w-full text-base" disabled={isPending}>
          {isPending ? "Please wait..." : "Reset password"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-full"
          disabled={isPending}
          onClick={() => setStep("request")}
        >
          Use a different email
        </Button>
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
        <p className="text-center text-base text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form className="space-y-5" noValidate onSubmit={requestResetCode}>
      <div className="space-y-2.5">
        <Label htmlFor="email" className="text-base">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={email}
          placeholder="you@company.com"
          className="h-12 text-base"
          required
        />
      </div>
      <Button type="submit" className="h-12 w-full text-base" disabled={isPending}>
        {isPending ? "Please wait..." : "Send reset code"}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      <p className="text-center text-base text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function PasswordField({
  id,
  label,
  autoComplete,
  placeholder,
  showPassword,
  onToggle,
}: {
  id: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-12 pr-11 text-base"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
