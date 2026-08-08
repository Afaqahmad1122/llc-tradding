export const CONTACT_EMAIL = "icctradingjp@gmail.com";
export const CONTACT_PHONE = "+81 70-6436-2003";
export const CONTACT_PHONE_TEL = "+817064362003";
export const WHATSAPP_URL = "https://wa.me/817064362003";
export const JAPAN_OFFICE_ADDRESS_LINES = [
  "3231102",
  "栃木県栃木市藤岡町赤麻字西原868番3",
  "株式会社ICC TRADING 御中",
  "323-1102",
  "Tochigi Ken, Tochigi Shi, Fujioka-cho, Akamaza, Nishihara 867-3, Japan",
  "ICC TRADING CO, LTD",
];

/** English line for compact UI (e.g. footer) */
export const JAPAN_OFFICE_ADDRESS_DISPLAY_EN =
  JAPAN_OFFICE_ADDRESS_LINES.find((line) => line.includes("Japan")) ?? JAPAN_OFFICE_ADDRESS_LINES[4]!;

export const INSTAGRAM_URL =
  "https://www.instagram.com/icc_trading_japan?utm_source=qr";
export const INSTAGRAM_HANDLE = "@icc_trading_japan";

export const CONTACT_EMAIL_MAILTO = `mailto:${CONTACT_EMAIL}`;
export const CONTACT_EMAIL_GMAIL_URL =
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}`;
export const CONTACT_PHONE_TEL_URL = `tel:${CONTACT_PHONE_TEL}`;

export type PublicContactSettings = {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
};

export const DEFAULT_CONTACT_SETTINGS: PublicContactSettings = {
  contactEmail: CONTACT_EMAIL,
  contactPhone: CONTACT_PHONE,
  whatsappNumber: CONTACT_PHONE,
};

export function phoneDigits(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function phoneTelValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("+") ? `+${phoneDigits(trimmed)}` : phoneDigits(trimmed);
}

export function contactLinks(settings: PublicContactSettings = DEFAULT_CONTACT_SETTINGS) {
  const email = settings.contactEmail || CONTACT_EMAIL;
  const phone = settings.contactPhone || CONTACT_PHONE;
  const whatsappNumber = settings.whatsappNumber || CONTACT_PHONE;
  const tel = phoneTelValue(phone);

  return {
    contactEmail: email,
    contactPhone: phone,
    whatsappNumber,
    contactEmailMailto: `mailto:${email}`,
    contactEmailGmailUrl:
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
    contactPhoneTelUrl: `tel:${tel}`,
    whatsappUrl: `https://wa.me/${phoneDigits(whatsappNumber)}`,
  };
}

export type OfficeContact = {
  title: string;
  lines: string[];
  phoneLabel?: string;
  phone?: string;
  phoneHref?: string;
  whatsappHref?: string;
};

export const OFFICE_CONTACTS: OfficeContact[] = [
  {
    title: "Australia Office",
    lines: ["28 Elderwood Ave", "TRUGANINA VIC 3029, AUSTRALIA"],
    phoneLabel: "Australia",
    phone: "+61 415 136 181",
    phoneHref: "tel:+61415136181",
  },
  {
    title: "Japan Office",
    lines: JAPAN_OFFICE_ADDRESS_LINES,
    phoneLabel: "Japan",
    phone: CONTACT_PHONE,
    phoneHref: CONTACT_PHONE_TEL_URL,
  },
  {
    title: "Pakistan Office",
    lines: [
      "Office 402, Tri Tower, 4th Floor",
      "Deans City, opposite Sarhad University, near Imtiaz Mall",
      "Peshawar, Pakistan",
    ],
  },
];
