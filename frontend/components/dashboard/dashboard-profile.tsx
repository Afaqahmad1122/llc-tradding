"use client";

import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, PencilLine, Save, UserRound, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

const emptyFormState: ProfileFormState = {
  name: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
};

const toFormState = (user: AuthUser): ProfileFormState => ({
  name: user.name,
  phone: user.phone ?? "",
  country: user.country ?? "",
  city: user.city ?? "",
  address: user.address ?? "",
  postalCode: user.postalCode ?? "",
});

export function DashboardProfile() {
  const user = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProfileFormState>(emptyFormState);

  const baseFormState = useMemo(() => (user ? toFormState(user) : emptyFormState), [user]);
  const visibleFormState = isEditing ? formState : baseFormState;

  if (!user) {
    return null;
  }

  const hasPendingChanges =
    visibleFormState.name.trim() !== baseFormState.name.trim() ||
    visibleFormState.phone.trim() !== baseFormState.phone.trim() ||
    visibleFormState.country.trim() !== baseFormState.country.trim() ||
    visibleFormState.city.trim() !== baseFormState.city.trim() ||
    visibleFormState.address.trim() !== baseFormState.address.trim() ||
    visibleFormState.postalCode.trim() !== baseFormState.postalCode.trim();

  const inputClassName =
    "h-11 rounded-[6px] border-[#452E5A]/15 bg-white px-3 text-sm shadow-sm focus-visible:border-[#452E5A]/35 focus-visible:ring-[#452E5A]/20 dark:border-white/15 dark:bg-white/5";

  const startEditing = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormState(baseFormState);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormState(baseFormState);
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
      toast.info("No changes to update.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateProfileApi(payload);
      setAuthUser(response.user);
      setFormState(toFormState(response.user));
      setSuccessMessage("Profile updated successfully.");
      toast.success("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        toast.error(error.message);
      } else {
        setErrorMessage("Failed to update profile. Please try again.");
        toast.error("Failed to update profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
              Account information
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6a5a84] dark:text-white/60">
              Keep these details updated so support and shipment teams can contact you quickly.
            </p>
          </div>
          {!isEditing ? (
            <Button type="button" variant="outline" className="h-10 rounded-[6px]" onClick={startEditing}>
              <PencilLine className="size-4" />
              Edit profile
            </Button>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileField
              id="dashboard-profile-name"
              label="Name"
              value={visibleFormState.name}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              required
              onChange={(value) => setFormState((previous) => ({ ...previous, name: value }))}
            />
            <ProfileField
              id="dashboard-profile-email"
              label="Email"
              value={user.email}
              inputClassName={inputClassName}
              disabled
              readOnly
            />
            <ProfileField
              id="dashboard-profile-phone"
              label="Phone"
              value={visibleFormState.phone}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              onChange={(value) => setFormState((previous) => ({ ...previous, phone: value }))}
            />
            <ProfileField
              id="dashboard-profile-country"
              label="Country"
              value={visibleFormState.country}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              onChange={(value) => setFormState((previous) => ({ ...previous, country: value }))}
            />
            <ProfileField
              id="dashboard-profile-city"
              label="City"
              value={visibleFormState.city}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              onChange={(value) => setFormState((previous) => ({ ...previous, city: value }))}
            />
            <ProfileField
              id="dashboard-profile-postal"
              label="Postal Code"
              value={visibleFormState.postalCode}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              onChange={(value) => setFormState((previous) => ({ ...previous, postalCode: value }))}
            />
            <ProfileField
              id="dashboard-profile-address"
              label="Address"
              value={visibleFormState.address}
              inputClassName={inputClassName}
              disabled={!isEditing || isSubmitting}
              className="md:col-span-2"
              onChange={(value) => setFormState((previous) => ({ ...previous, address: value }))}
            />
          </div>

          {errorMessage ? (
            <p className="flex items-center gap-2 rounded-[6px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              <XCircle className="size-4 shrink-0" />
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="flex items-center gap-2 rounded-[6px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="size-4 shrink-0" />
              {successMessage}
            </p>
          ) : null}

          {isEditing ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting || !hasPendingChanges} className="h-10 rounded-[6px]">
                <Save className="size-4" />
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" disabled={isSubmitting} className="h-10 rounded-[6px]" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          ) : null}
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5">
          <span className="grid size-12 place-items-center rounded-[8px] bg-[#f4efff] text-[#452E5A] dark:bg-white/10 dark:text-white">
            <UserRound className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[#1E104E] dark:text-white">
            {user.name}
          </h2>
          <p className="mt-1 break-all text-sm text-[#6a5a84] dark:text-white/60">{user.email}</p>
          <div className="mt-5 grid gap-3 text-sm">
            <ProfileMeta label="Role" value={user.role} />
            <ProfileMeta label="Status" value="Active" />
            <ProfileMeta label="Country" value={baseFormState.country || "Not provided"} />
          </div>
        </div>
      </aside>
    </div>
  );
}

type ProfileFieldProps = {
  id: string;
  label: string;
  value: string;
  inputClassName: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
};

function ProfileField({
  id,
  label,
  value,
  inputClassName,
  disabled = false,
  readOnly = false,
  required = false,
  className,
  onChange,
}: ProfileFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className={inputClassName}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}

function ProfileMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-[#452E5A]/10 bg-[#fbf9ff] p-3 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-medium uppercase tracking-wide text-[#7a6798] dark:text-white/50">
        {label}
      </p>
      <p className="mt-1 font-semibold text-[#1E104E] dark:text-white">{value}</p>
    </div>
  );
}
