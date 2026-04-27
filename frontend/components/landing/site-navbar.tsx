import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import { NavbarAuthActions } from "@/components/landing/navbar-auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";

type NavChildItem = {
  label: string;
  href: string;
};

type NavItem = {
  label: string;
  href?: string;
  children?: NavChildItem[];
};

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  {
    label: "About Us",
    children: [
      { label: "Company Profile", href: "/about/company-profile" },
      { label: "Payment Information", href: "/about/payment-information" },
      { label: "Why Choose Us", href: "/about/why-choose-us" },
    ],
  },
  { label: "Reviews", href: "/reviews" },
  { label: "Auto Parts", href: "/auto-parts" },
  {
    label: "Help",
    children: [
      { label: "How to Buy", href: "/help/how-to-buy" },
      { label: "Shipping Information", href: "/help/shipping-information" },
      { label: "FAQs", href: "/help/faqs" },
    ],
  },
  {
    label: "Contact Us",
    children: [
      { label: "Connect With Us", href: "/contact/connect-with-us" },
      { label: "Global Offices", href: "/contact/global-offices" },
    ],
  },
  { label: "Careers", href: "/careers" },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#452E5A]/15 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c0720]/80">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-[#452E5A]/20 bg-white shadow-sm dark:border-white/30 dark:bg-white/10">
            <span className="bg-linear-to-r from-[#1E104E] via-[#452E5A] to-[#FF653F] bg-clip-text text-lg font-extrabold text-transparent dark:from-white dark:via-white dark:to-[#FFC85C]">
              I
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-lg leading-none font-bold tracking-tight bg-linear-to-r from-[#1E104E] via-[#452E5A] to-[#FF653F] bg-clip-text text-transparent sm:text-xl dark:from-white dark:via-white dark:to-[#FFC85C]">
              Icc Trading Co Ltd
            </p>
            <p className="hidden truncate text-[11px] text-[#452E5A]/80 sm:block dark:text-white/85">
              Premium Japanese Vehicle Export
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 hover:text-[#1E104E] dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {item.label}
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="pointer-events-none invisible absolute left-0 top-full z-50 w-56 pt-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                  <div className="translate-y-1 rounded-2xl border border-[#452E5A]/10 bg-white/95 p-2 shadow-xl backdrop-blur-md transition-all duration-150 group-hover:translate-y-0 dark:border-white/10 dark:bg-[#150e2e]/95">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-[#2E2A36] transition-colors hover:bg-[#452E5A]/8 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 hover:text-[#1E104E] dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <NavbarAuthActions />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <details className="relative">
            <summary className="flex list-none cursor-pointer items-center gap-2 rounded-md border border-[#452E5A]/20 px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <Menu className="size-4" />
              Menu
            </summary>
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-[#452E5A]/15 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#150e2e]">
              <nav className="flex flex-col">
                {navItems.map((item) =>
                  item.children ? (
                    <details key={item.label} className="group rounded-md px-3 py-2">
                      <summary className="flex list-none items-center gap-1 text-sm font-semibold text-[#452E5A] cursor-pointer dark:text-white [&::-webkit-details-marker]:hidden">
                        {item.label}
                        <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-1 space-y-1 pl-3">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block rounded-md px-2 py-1.5 text-sm font-medium text-[#452E5A]/90 hover:bg-[#452E5A]/8 dark:text-white/75 dark:hover:bg-white/10"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href ?? "#"}
                      className="rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] hover:bg-[#452E5A]/8 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
              </nav>
              <div className="mt-2 flex gap-2 border-t border-[#452E5A]/10 pt-2 dark:border-white/10">
                <NavbarAuthActions mobile />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
