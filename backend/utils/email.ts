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
});

const otpTemplate = (name: string, code: string): string => `
<div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
  <h2 style="margin-bottom: 12px;">Email verification code</h2>
  <p>Hi ${name},</p>
  <p>Your OTP for LLC Trading account verification is:</p>
  <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 12px 0;">
    ${code}
  </p>
  <p>This code expires in 10 minutes. If you did not create this account, please ignore this email.</p>
</div>
`;

export const generateOtpCode = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendVerificationOtpEmail = async (
  email: string,
  name: string,
  code: string,
): Promise<void> => {
  await mailTransporter.sendMail({
    from: env.MAIL_FROM,
    to: email,
    subject: "Your LLC Trading verification code",
    html: otpTemplate(name, code),
    text: `Hi ${name}, your LLC Trading verification code is ${code}. This code expires in 10 minutes.`,
  });
};
