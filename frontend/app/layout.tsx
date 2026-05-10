import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { SITE_ORIGIN } from "./seo";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFloat } from "@/components/whatsapp-float";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "ICC Trading Co Ltd | Japanese Used Cars Export",
    template: "%s | ICC Trading Co Ltd",
  },
  description:
    "Discover export-ready Japanese used cars with transparent pricing, category browsing, and direct quote support from ICC Trading Co Ltd.",
  keywords: [
    "Japanese used cars",
    "used cars export Japan",
    "ICC Trading Co Ltd",
    "import cars from Japan",
    "Japan car exporter",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: SITE_ORIGIN,
    siteName: "ICC Trading Co Ltd",
    title: "ICC Trading Co Ltd | Japanese Used Cars Export",
    description:
      "Discover export-ready Japanese used cars with transparent pricing, category browsing, and direct quote support from ICC Trading Co Ltd.",
    images: [
      {
        url: "/bernardsie-honda-1596081_1920.png",
        width: 1920,
        height: 1280,
        alt: "ICC Trading Japanese used cars",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ICC Trading Co Ltd | Japanese Used Cars Export",
    description:
      "Discover export-ready Japanese used cars with transparent pricing, category browsing, and direct quote support from ICC Trading Co Ltd.",
    images: ["/bernardsie-honda-1596081_1920.png"],
  },
  icons: {
    icon: "/body-types/logo_hino.png",
    shortcut: "/body-types/logo_hino.png",
    apple: "/body-types/logo_hino.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <WhatsAppFloat />
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
