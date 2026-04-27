"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, PencilLine, Save, XCircle } from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, type AuthUser, updateProfileApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type ProfileFormState = {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
};

const toFormState = (user: AuthUser): ProfileFormState => ({
  name: user.name,
  phone: user.phone ?? "",
  country: user.country ?? "",
  city: user.city ?? "",
  address: user.address ?? "",
  postalCode: user.postalCode ?? "",
});

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>({
    name: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
  });

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (!user) {
      router.replace("/login");
    }
  }, [hasBootstrapped, router, user]);

  const baseFormState = useMemo(
    () =>
      user
        ? toFormState(user)
        : {
            name: "",
            phone: "",
            country: "",
            city: "",
            address: "",
            postalCode: "",
          },
    [user],
  );

  useEffect(() => {
    if (isEditing) {
      return;
    }

    setFormState(baseFormState);
  }, [baseFormState, isEditing]);

  if (!hasBootstrapped || !user) {
    return null;
  }

  const hasPendingChanges =
    formState.name.trim() !== baseFormState.name.trim() ||
    formState.phone.trim() !== baseFormState.phone.trim() ||
    formState.country.trim() !== baseFormState.country.trim() ||
    formState.city.trim() !== baseFormState.city.trim() ||
    formState.address.trim() !== baseFormState.address.trim() ||
    formState.postalCode.trim() !== baseFormState.postalCode.trim();
  const profileInputClassName =
    "h-11 rounded-xl border-[#452E5A]/15 bg-white/90 px-3 text-sm shadow-sm focus-visible:border-[#452E5A]/35 focus-visible:ring-[#452E5A]/20 md:h-12 md:text-[0.95rem] dark:border-white/15 dark:bg-white/5";

  const onCancelEdit = () => {
    setFormState(baseFormState);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsEditing(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: Record<string, string> = {};
    if (formState.name.trim() !== baseFormState.name.trim()) {
      payload.name = formState.name.trim();
    }
    if (formState.phone.trim() !== baseFormState.phone.trim()) {
      payload.phone = formState.phone.trim();
    }
    if (formState.country.trim() !== baseFormState.country.trim()) {
      payload.country = formState.country.trim();
    }
    if (formState.city.trim() !== baseFormState.city.trim()) {
      payload.city = formState.city.trim();
    }
    if (formState.address.trim() !== baseFormState.address.trim()) {
      payload.address = formState.address.trim();
    }
    if (formState.postalCode.trim() !== baseFormState.postalCode.trim()) {
      payload.postalCode = formState.postalCode.trim();
    }

    if (Object.keys(payload).length === 0) {
      setSuccessMessage("No changes to update.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateProfileApi(payload);
      setAuthUser(response.user);
      setFormState(toFormState(response.user));
      setSuccessMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0c0720] dark:via-[#120932] dark:to-[#1a0e3d]">
      <SiteNavbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center px-4 py-14 sm:px-6 lg:px-8">
        <Card className="w-full max-w-3xl border-[#452E5A]/15 bg-white/90 shadow-xl shadow-[#2e1e56]/10 backdrop-blur dark:bg-[#150e2e]/85">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-3xl text-[#1E104E] dark:text-white">My Profile</CardTitle>
                <CardDescription className="mt-1">
                  Keep your account details up to date for faster support and smoother order handling.
                </CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#452E5A]/25 bg-white/80 hover:bg-[#f4efff] dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setFormState(baseFormState);
                    setIsEditing(true);
                  }}
                >
                  <PencilLine className="mr-1 size-4" />
                  Edit profile
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-7 text-sm sm:space-y-8 sm:text-base">
            <div className="grid grid-cols-1 gap-4 rounded-2xl bg-[#f7f2ff] p-4 sm:grid-cols-3 sm:gap-5 sm:p-5 dark:bg-white/5">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#5e4b7c]/80 dark:text-white/60">Role</p>
                <p className="mt-1 font-semibold tracking-wide text-[#2b1848] dark:text-white">
                  {user.role}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#5e4b7c]/80 dark:text-white/60">
                  Account Email
                </p>
                <p className="mt-1 font-medium text-[#2b1848] dark:text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#5e4b7c]/80 dark:text-white/60">Status</p>
                <p className="mt-1 font-medium text-emerald-700 dark:text-emerald-300">Active</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="profile-name">Name</Label>
                  <Input
                    id="profile-name"
                    className={profileInputClassName}
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, name: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="profile-email">Email</Label>
                  <Input id="profile-email" className={profileInputClassName} value={user.email} disabled readOnly />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="profile-phone">Phone</Label>
                  <Input
                    id="profile-phone"
                    className={profileInputClassName}
                    value={formState.phone}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, phone: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="profile-country">Country</Label>
                  <Input
                    id="profile-country"
                    className={profileInputClassName}
                    value={formState.country}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, country: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="profile-city">City</Label>
                  <Input
                    id="profile-city"
                    className={profileInputClassName}
                    value={formState.city}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, city: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="profile-postal-code">Postal Code</Label>
                  <Input
                    id="profile-postal-code"
                    className={profileInputClassName}
                    value={formState.postalCode}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, postalCode: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
                <div className="space-y-2.5 sm:col-span-2">
                  <Label htmlFor="profile-address">Address</Label>
                  <Input
                    id="profile-address"
                    className={profileInputClassName}
                    value={formState.address}
                    onChange={(event) =>
                      setFormState((previous) => ({ ...previous, address: event.target.value }))
                    }
                    disabled={!isEditing || isSubmitting}
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  <XCircle className="size-4 shrink-0" />
                  {errorMessage}
                </p>
              ) : null}
              {successMessage ? (
                <p className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {successMessage}
                </p>
              ) : null}

              {isEditing ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" disabled={isSubmitting || !hasPendingChanges}>
                    <Save className="mr-1 size-4" />
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancelEdit}>
                    Cancel
                  </Button>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
