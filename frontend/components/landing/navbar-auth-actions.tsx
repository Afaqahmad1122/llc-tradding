"use client";

import Link from "next/link";
import { CircleUserRound, LogOut, Settings, ShieldCheck, User } from "lucide-react";
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
import { useAuthStore } from "@/stores/auth-store";

export function NavbarAuthActions({ mobile = false }: { mobile?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();

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
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex-1 border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
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
          className="border-[#452E5A]/25 text-[#452E5A] hover:bg-[#452E5A]/8 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
        >
          <Link href="/login">Login</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
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
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
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
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
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
