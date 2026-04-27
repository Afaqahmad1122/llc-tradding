import { z } from "zod";

const trimmedString = z.string().trim();
const optionalTrimmed = z.string().trim().optional();

const profileFields = {
  phone: optionalTrimmed,
  country: optionalTrimmed,
  city: optionalTrimmed,
  address: optionalTrimmed,
  postalCode: optionalTrimmed,
};

export const registerSchema = z.object({
  name: trimmedString.min(1, "name is required"),
  email: trimmedString.email("invalid email"),
  password: z.string().min(1, "password is required"),
  confirmPassword: z.string().optional(),
  ...profileFields,
});

export const loginSchema = z.object({
  email: trimmedString.email("invalid email"),
  password: z.string().min(1, "password is required"),
});

export const verifyOtpSchema = z.object({
  email: trimmedString.email("invalid email"),
  otp: trimmedString.min(1, "otp is required"),
});

export const forgotPasswordSchema = z.object({
  email: trimmedString.email("invalid email"),
});

export const resetPasswordSchema = z.object({
  email: trimmedString.email("invalid email"),
  otp: trimmedString.min(1, "otp is required"),
  newPassword: z.string().min(1, "newPassword is required"),
  confirmNewPassword: z.string().optional(),
});

export const updateProfileSchema = z
  .object({
    name: optionalTrimmed,
    ...profileFields,
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.phone !== undefined ||
      value.country !== undefined ||
      value.city !== undefined ||
      value.address !== undefined ||
      value.postalCode !== undefined,
    {
      message: "at least one profile field is required",
    },
  );
