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

export type ContactMessageNotification = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  company: string | null;
  vehicleRequirement: string | null;
  message: string;
  createdAt: Date;
};

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

const contactMessageTemplate = (contact: ContactMessageNotification): string => {
  const rows: Array<[string, string | null]> = [
    ["Name", contact.name],
    ["Email", contact.email],
    ["Phone", contact.phone],
    ["Country", contact.country],
    ["City", contact.city],
    ["Company", contact.company],
    ["Vehicle requirement", contact.vehicleRequirement],
  ];

  const detailRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">${escapeHtml(label)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${escapeHtml(value ?? "Not provided")}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827; max-width: 680px;">
      <h2 style="margin: 0 0 8px;">New Contact Us message</h2>
      <p style="margin: 0 0 20px; color: #4b5563;">
        A visitor submitted the contact form on the LLC Trading website.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${detailRows}
      </table>
      <h3 style="margin: 0 0 8px;">Message</h3>
      <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; white-space: normal;">
        ${escapeHtml(contact.message).replace(/\r?\n/g, "<br />")}
      </div>
      <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
        Message ID: ${escapeHtml(contact.id)}<br />
        Received: ${escapeHtml(contact.createdAt.toISOString())}
      </p>
    </div>
  `;
};

const contactMessageText = (contact: ContactMessageNotification): string =>
  [
    "New Contact Us message",
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone: ${contact.phone}`,
    `Country: ${contact.country ?? "Not provided"}`,
    `City: ${contact.city ?? "Not provided"}`,
    `Company: ${contact.company ?? "Not provided"}`,
    `Vehicle requirement: ${contact.vehicleRequirement ?? "Not provided"}`,
    "",
    "Message:",
    contact.message,
    "",
    `Message ID: ${contact.id}`,
    `Received: ${contact.createdAt.toISOString()}`,
  ].join("\n");

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

export const sendContactMessageNotification = async (
  contact: ContactMessageNotification,
): Promise<void> => {
  const senderName = contact.name.replace(/[\r\n]+/g, " ").trim();

  await mailTransporter.sendMail({
    from: env.MAIL_FROM,
    to: env.CONTACT_NOTIFICATION_EMAIL,
    replyTo: contact.email,
    subject: `New website contact message from ${senderName}`,
    html: contactMessageTemplate(contact),
    text: contactMessageText(contact),
  });
};
