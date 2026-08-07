"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  LayoutDashboard,
  PackageCheck,
  Ship,
  UserRound,
} from "lucide-react";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type DashboardSection = "overview" | "orders" | "shipments" | "profile";

type UserDashboardShellProps = {
  activeSection: DashboardSection;
  title: string;
  description: string;
  children: ReactNode;
};

const navItems = [
  { label: "Overview", href: "/dashboard", section: "overview", icon: LayoutDashboard },
  { label: "My Orders", href: "/dashboard/orders", section: "orders", icon: PackageCheck },
  { label: "Shipments", href: "/dashboard/shipments", section: "shipments", icon: Ship },
  { label: "Profile", href: "/dashboard/profile", section: "profile", icon: UserRound },
] as const;

export function UserDashboardShell({
  activeSection,
  title,
  description,
  children,
}: UserDashboardShellProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "USER") {
      router.replace("/");
    }
  }, [hasBootstrapped, router, user]);

  if (!hasBootstrapped || !user || user.role !== "USER") {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-[#faf8fc] text-[#1E104E] dark:bg-[#0c0720] dark:text-white">
      <SiteNavbar />
      <main className="mx-auto grid w-full max-w-screen-2xl flex-1 gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-5 lg:px-7 lg:py-7 xl:px-10">
        <aside className="h-fit rounded-[8px] border border-[#452E5A]/12 bg-white/95 p-2 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24 lg:p-3">
          <div className="hidden px-2 py-3 lg:block">
            <p className="truncate text-sm font-semibold text-[#1E104E] dark:text-white">
              {user.name}
            </p>
            <p className="mt-1 truncate text-xs text-[#6a5a84] dark:text-white/60">
              {user.email}
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.section === activeSection;

              return (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "h-10 min-w-0 justify-start rounded-[6px] px-3 text-sm font-medium text-[#4e3a68] hover:bg-[#f3edff] hover:text-[#1E104E] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white lg:h-11",
                    isActive &&
                      "bg-[#452E5A] text-white hover:bg-[#452E5A] hover:text-white dark:bg-white dark:text-[#1E104E] dark:hover:bg-white dark:hover:text-[#1E104E]",
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0 space-y-4 lg:space-y-5">
          <div className="rounded-[8px] border border-[#452E5A]/12 bg-white/95 px-4 py-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:px-5 lg:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#7a6798] dark:text-white/55">
                  Customer Dashboard
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-normal text-[#1E104E] dark:text-white sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6a5a84] dark:text-white/65">
                  {description}
                </p>
              </div>
              <Button
                asChild
                className="h-10 w-full rounded-[6px] bg-[#FF653F] px-4 text-sm font-semibold text-white hover:bg-[#e85634] sm:w-auto"
              >
                <Link href="/cars">Browse cars</Link>
              </Button>
            </div>
          </div>

          {children}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
