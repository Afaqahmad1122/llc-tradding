import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    <header className="sticky top-0 z-40 border-b border-[#452E5A]/15 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-304 items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg border border-[#452E5A]/20 bg-white shadow-sm">
            <span className="bg-linear-to-r from-[#1E104E] via-[#452E5A] to-[#FF653F] bg-clip-text text-lg font-extrabold text-transparent">
              L
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-heading text-lg leading-none font-bold tracking-tight bg-linear-to-r from-[#1E104E] via-[#452E5A] to-[#FF653F] bg-clip-text text-transparent sm:text-xl">
              LLC Trading
            </p>
            <p className="hidden truncate text-[11px] text-[#452E5A]/80 sm:block">
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
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 hover:text-[#1E104E]"
                >
                  {item.label}
                  <ChevronDown className="size-3.5" />
                </button>
                <div className="pointer-events-none invisible absolute left-0 z-50 mt-2 w-56 translate-y-1 rounded-2xl border border-[#452E5A]/10 bg-white/95 p-2 opacity-0 shadow-xl backdrop-blur-md transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-[#2E2A36] transition-colors hover:bg-[#452E5A]/8"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className="rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 hover:text-[#1E104E]"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="outline"
            size="sm"
            className="border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8"
          >
            Login
          </Button>
          <Button
            size="sm"
            className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
          >
            Register
          </Button>
        </div>

        <details className="relative lg:hidden">
          <summary className="flex list-none cursor-pointer items-center gap-2 rounded-md border border-[#452E5A]/20 px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 [&::-webkit-details-marker]:hidden">
            <Menu className="size-4" />
            Menu
          </summary>
          <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-[#452E5A]/15 bg-white p-2 shadow-xl">
            <nav className="flex flex-col">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="rounded-md px-3 py-2">
                    <p className="flex items-center gap-1 text-sm font-semibold text-[#452E5A]">
                      {item.label}
                      <ChevronDown className="size-3.5" />
                    </p>
                    <div className="mt-1 space-y-1 pl-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block rounded-md px-2 py-1.5 text-sm font-medium text-[#452E5A]/90 hover:bg-[#452E5A]/8"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className="rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] hover:bg-[#452E5A]/8"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
            <div className="mt-2 flex gap-2 border-t border-[#452E5A]/10 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8"
              >
                Login
              </Button>
              <Button
                size="sm"
                className="flex-1 border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
              >
                Register
              </Button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
