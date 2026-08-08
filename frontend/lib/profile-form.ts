import type { AuthUser } from "@/lib/api";

export type ProfileFormState = {
  name: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  postalCode: string;
};

export const emptyProfileFormState: ProfileFormState = {
  name: "",
  phone: "",
  country: "",
  city: "",
  address: "",
  postalCode: "",
};

const profileFormFields = [
  "name",
  "phone",
  "country",
  "city",
  "address",
  "postalCode",
] as const;

export const toProfileFormState = (user: AuthUser): ProfileFormState => ({
  name: user.name,
  phone: user.phone ?? "",
  country: user.country ?? "",
  city: user.city ?? "",
  address: user.address ?? "",
  postalCode: user.postalCode ?? "",
});

export function buildProfileUpdatePayload(
  formState: ProfileFormState,
  baseFormState: ProfileFormState,
) {
  return profileFormFields.reduce<Record<string, string>>((payload, field) => {
    const value = formState[field].trim();
    if (value !== baseFormState[field].trim()) {
      payload[field] = value;
    }
    return payload;
  }, {});
}

export function hasProfileChanges(
  formState: ProfileFormState,
  baseFormState: ProfileFormState,
) {
  return Object.keys(buildProfileUpdatePayload(formState, baseFormState)).length > 0;
}
