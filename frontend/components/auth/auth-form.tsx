"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { useRegisterMutation } from "@/hooks/use-register-mutation";
import { useVerifyOtpMutation } from "@/hooks/use-verify-otp-mutation";
import { ApiError } from "@/lib/api";

type AuthField = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder: string;
};

type AuthFormProps = {
  mode: "login" | "signup" | "verify";
  fields: AuthField[];
  submitLabel: string;
  initialValues?: Partial<Record<string, string>>;
};

export function AuthForm({
  mode,
  fields,
  submitLabel,
  initialValues,
}: AuthFormProps) {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const activeMutation =
    mode === "login"
      ? loginMutation
      : mode === "signup"
        ? registerMutation
        : verifyOtpMutation;

  const togglePasswordVisibility = (fieldId: string) => {
    setVisiblePasswords((previous) => ({
      ...previous,
      [fieldId]: !previous[fieldId],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (mode === "signup") {
      const name = String(formData.get("fullName") ?? "").trim();
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      try {
        await registerMutation.mutateAsync({ name, email, password, confirmPassword });
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Unable to create account";
        setErrorMessage(message);
      }
      return;
    }

    if (mode === "verify") {
      const otp = String(formData.get("otp") ?? "").trim();
      try {
        await verifyOtpMutation.mutateAsync({ email, otp });
        router.push("/login?verified=1");
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Unable to verify code";
        setErrorMessage(message);
      }
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push("/");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to sign in";
      setErrorMessage(message);
    }
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div className="space-y-2.5" key={field.id}>
          <Label htmlFor={field.id} className="text-base">
            {field.label}
          </Label>
          <div className="relative">
            <Input
              id={field.id}
              name={field.id}
              type={field.type === "password" && visiblePasswords[field.id] ? "text" : field.type}
              autoComplete={field.autoComplete}
              defaultValue={initialValues?.[field.id] ?? ""}
              placeholder={field.placeholder}
              className="h-12 pr-11 text-base"
              required
            />
            {field.type === "password" ? (
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field.id)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={visiblePasswords[field.id] ? "Hide password" : "Show password"}
                aria-pressed={Boolean(visiblePasswords[field.id])}
              >
                {visiblePasswords[field.id] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            ) : null}
          </div>
        </div>
      ))}
      <Button type="submit" className="h-12 w-full text-base" disabled={activeMutation.isPending}>
        {activeMutation.isPending ? "Please wait..." : submitLabel}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </form>
  );
}
