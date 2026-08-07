"use client";

import Link from "next/link";
import {
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { usePendingReviewEligibilityQuery } from "@/hooks/use-pending-review-eligibility-query";
import { useAuthStore } from "@/stores/auth-store";

export function NavbarAuthActions({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const { data: eligibilityData, isSuccess: eligibilityLoaded } =
    usePendingReviewEligibilityQuery();
  const showWriteReview =
    Boolean(user?.id) &&
    eligibilityLoaded &&
    (eligibilityData?.data?.length ?? 0) > 0;
  const showCustomerDashboard = user?.role === "USER";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch {
      return;
    }
  };

  if (!user) {
    if (mobile) {
      return (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 flex-1 rounded-[4px] border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-sm font-semibold text-[#1E104E] shadow-sm transition-shadow hover:opacity-90 hover:shadow-md"
          >
            <Link href="/signup">Register</Link>
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-10 rounded-[4px] border-[#452E5A]/25 px-5 text-sm font-semibold text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="h-10 rounded-[4px] border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] px-5 text-sm font-semibold text-[#1E104E] shadow-sm transition-shadow hover:opacity-90 hover:shadow-md"
        >
          <Link href="/signup">Register</Link>
        </Button>
      </>
    );
  }

  if (mobile) {
    return (
      <>
        <div className="flex w-full items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="h-11 w-11 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                aria-label="Open user menu"
              >
                <CircleUserRound className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {showCustomerDashboard ? (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {showWriteReview ? (
                <DropdownMenuItem asChild>
                  <Link href="/reviews/submit">
                    <Star className="size-4" />
                    Write a review
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {user.role === "ADMIN" ? (
                <DropdownMenuItem asChild>
                  <Link href="/admin/contact-messages">
                    <ShieldCheck className="size-4" />
                    Admin Messages
                  </Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem>
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                variant="destructive"
              >
                <LogOut className="size-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="h-11 w-11 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
            aria-label="Open user menu"
          >
            <CircleUserRound className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showCustomerDashboard ? (
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
          ) : null}
          {showWriteReview ? (
            <DropdownMenuItem asChild>
              <Link href="/reviews/submit">
                <Star className="size-4" />
                Write a review
              </Link>
            </DropdownMenuItem>
          ) : null}
          {user.role === "ADMIN" ? (
            <DropdownMenuItem asChild>
              <Link href="/admin/contact-messages">
                <ShieldCheck className="size-4" />
                Admin Messages
              </Link>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            variant="destructive"
          >
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
