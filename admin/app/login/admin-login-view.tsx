"use client";

import type { FormEvent } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { useAdminAuthStore } from "@/stores/auth-store";

export function AdminLoginView() {
  const router = useRouter();
  const hasBootstrapped = useAdminAuthStore((s) => s.hasBootstrapped);
  const user = useAdminAuthStore((s) => s.user);
  const loginMutation = useAdminLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (user?.role === "ADMIN") {
      router.replace("/");
    }
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (user?.role === "ADMIN") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center p-6">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: email.trim(), password });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Use your administrator account. There is no self-service signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                  disabled={loginMutation.isPending}
                />
                {loginMutation.isError ? (
                  <FieldError>{loginMutation.error.message}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              className="w-full gap-2"
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
