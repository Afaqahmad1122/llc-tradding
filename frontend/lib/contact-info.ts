export const CONTACT_EMAIL = "icctradingjp@gmail.com";
export const CONTACT_PHONE = "+81 70-6436-2003";
export const CONTACT_PHONE_TEL = "+817064362003";
export const WHATSAPP_URL = "https://wa.me/817064362003";
export const UGANDA_CONTACT_PHONE = "+256 755 419 993";
export const UGANDA_CONTACT_PHONE_TEL = "+256755419993";
export const UGANDA_WHATSAPP_URL = "https://wa.me/256755419993";
export const UGANDA_OFFICE_ADDRESS = "Kampala, Nakawa, Future Holding Bond";
export const JAPAN_OFFICE_ADDRESS_LINES = [
  "3231102",
  "栃木県栃木市藤岡町赤麻字西原868番3",
  "株式会社ICC TRADING 御中",
  "323-1102",
  "Tochigi Ken, Tochigi Shi, Fujioka-cho, Akamaza, Nishihara 867-3, Japan",
  "ICC TRADING CO, LTD",
];
export const INSTAGRAM_URL =
  "https://www.instagram.com/icc_trading_japan?utm_source=qr";
export const INSTAGRAM_HANDLE = "@icc_trading_japan";

export const CONTACT_EMAIL_MAILTO = `mailto:${CONTACT_EMAIL}`;
export const CONTACT_PHONE_TEL_URL = `tel:${CONTACT_PHONE_TEL}`;
export const UGANDA_CONTACT_PHONE_TEL_URL = `tel:${UGANDA_CONTACT_PHONE_TEL}`;

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
  {
    title: "Uganda Office",
    lines: [UGANDA_OFFICE_ADDRESS],
    phoneLabel: "Uganda",
    phone: UGANDA_CONTACT_PHONE,
    phoneHref: UGANDA_CONTACT_PHONE_TEL_URL,
    whatsappHref: UGANDA_WHATSAPP_URL,
  },
];
