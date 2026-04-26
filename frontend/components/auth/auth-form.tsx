"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/use-login-mutation";
import { useRegisterMutation } from "@/hooks/use-register-mutation";
import { ApiError } from "@/lib/api";

type AuthField = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder: string;
};

type AuthFormProps = {
  mode: "login" | "signup";
  fields: AuthField[];
  submitLabel: string;
};

export function AuthForm({ mode, fields, submitLabel }: AuthFormProps) {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeMutation = mode === "login" ? loginMutation : registerMutation;

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
        router.push("/");
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "Unable to create account";
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
          <Input
            id={field.id}
            name={field.id}
            type={field.type}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            className="h-12 text-base"
            required
          />
        </div>
      ))}
      <Button type="submit" className="h-12 w-full text-base" disabled={activeMutation.isPending}>
        {activeMutation.isPending ? "Please wait..." : submitLabel}
      </Button>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </form>
  );
}
