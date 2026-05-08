import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const mailTransporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  ...(env.NODE_ENV === "production"
    ? { pool: true, maxConnections: 5, maxMessages: 100 }
    : {}),
});

const otpTemplate = (name: string, code: string, title: string, purposeText: string): string => `
<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
  <h2 style="margin-bottom: 12px;">${title}</h2>
  <p>Hi ${name},</p>
  <p>${purposeText}</p>
  <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 12px 0;">
    ${code}
  </p>
  <p>This code expires in 10 minutes. If you did not create this account, please ignore this email.</p>
</div>
`;

const sendOtpEmail = async (
  email: string,
  name: string,
  code: string,
  subject: string,
  title: string,
  purposeText: string,
): Promise<void> => {
  await mailTransporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject,
    html: otpTemplate(name, code, title, purposeText),
    text: `Hi ${name}, ${purposeText} ${code}. This code expires in 10 minutes.`,
  });
};

export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  code: string,
): Promise<void> => {
  await sendOtpEmail(
    email,
    name,
    code,
    "Your LLC Trading verification code",
    "Email verification code",
    "Your OTP for LLC Trading account verification is:",
  );
};

export const sendPasswordResetOtpEmail = async (
  email: string,
  name: string,
  code: string,
): Promise<void> => {
  await sendOtpEmail(
    email,
    name,
    code,
    "Your LLC Trading password reset code",
    "Password reset code",
    "Your OTP to reset your LLC Trading password is:",
  );
};
