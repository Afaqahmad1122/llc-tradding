"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  CarFront,
  Inbox,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Shield,
  Ship,
  Star,
  Users,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { useAdminLogoutMutation } from "@/hooks/use-admin-logout-mutation";
import { useAdminAuthStore } from "@/stores/auth-store";
import type { StaffPermissions } from "@/lib/api/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permissionKey?: keyof StaffPermissions;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/cars", label: "Cars", icon: CarFront, permissionKey: "carsRead" },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    permissionKey: "carsRead",
  },
  { href: "/dashboard/careers", label: "Careers", icon: Briefcase, permissionKey: "careersRead" },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star, permissionKey: "reviewsRead" },
  {
    href: "/dashboard/contact-messages",
    label: "Contact messages",
    icon: Inbox,
    permissionKey: "contactRead",
  },
  { href: "/dashboard/shipping", label: "Shipping", icon: Ship, permissionKey: "shippingRead" },
  { href: "/dashboard/ledger", label: "Ledger", icon: ReceiptText, permissionKey: "ledgerRead" },
  { href: "/dashboard/users", label: "Staff", icon: Users, adminOnly: true },
  {
    href: "/dashboard/all-users",
    label: "All Users",
    icon: UsersRound,
    adminOnly: true,
  },
];

function navItemActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminSidebarNav() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  const hasPermission = useAdminAuthStore((state) => state.hasPermission);

  const closeMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly) return isAdmin();
    if (!item.permissionKey) return true;
    return hasPermission(item.permissionKey);
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={navItemActive(pathname, href)}
              >
                <Link href={href} onClick={closeMobile}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AdminNavbarSignOut() {
  const logout = useAdminLogoutMutation();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={logout.isPending}
      onClick={() => logout.mutate(undefined)}
      className="h-9 gap-2 border-border/80 bg-background/80 shadow-xs backdrop-blur-sm sm:px-3"
      aria-label={logout.isPending ? "Signing out" : "Sign out"}
    >
      {logout.isPending ? (
        <Spinner className="size-4" aria-hidden />
      ) : (
        <LogOut className="size-4" aria-hidden />
      )}
      <span className="hidden sm:inline">Sign out</span>
    </Button>
  );
}

export function AdminDashboardShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border bg-sidebar/50">
          <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sidebar-primary to-sidebar-primary/85 text-sidebar-primary-foreground shadow-sm ring-1 ring-sidebar-primary/25">
              <Shield className="size-4" aria-hidden />
            </div>
            <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">Admin</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                ICC Trading
              </span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarNav />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset
        className={cn(
          "min-h-svh bg-[linear-gradient(160deg,color-mix(in_oklch,var(--muted)_56%,transparent)_0%,transparent_42%),linear-gradient(to_bottom,var(--background),color-mix(in_oklch,var(--muted)_22%,var(--background)))]",
          className,
        )}
      >
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/70 md:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />
            <AdminNavbarSignOut />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
