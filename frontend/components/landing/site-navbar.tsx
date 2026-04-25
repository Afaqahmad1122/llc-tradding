import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Featured", href: "#featured" },
  { label: "Cars", href: "#inventory" },
  { label: "About Us", href: "#about" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact Us", href: "#contact" },
];

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#452E5A]/15 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] transition-colors hover:bg-[#452E5A]/8 hover:text-[#1E104E]"
            >
              {item.label}
            </Link>
          ))}
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
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[#452E5A] hover:bg-[#452E5A]/8"
                >
                  {item.label}
                </Link>
              ))}
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
