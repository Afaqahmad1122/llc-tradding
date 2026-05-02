"use client";

import { ReactNode } from "react";
import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";

type LandingPageShellProps = {
  children: ReactNode;
  showBackgroundGlows?: boolean;
  mainClassName?: string;
};

export function LandingPageShell({
  children,
  showBackgroundGlows = false,
  mainClassName,
}: LandingPageShellProps) {
  return (
    <div className="bg-marketing-page-gradient relative flex min-h-screen flex-col overflow-x-clip">
      {showBackgroundGlows ? (
        <>
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#452E5A]/20 blur-3xl dark:bg-[#FF653F]/15" />
          <div className="pointer-events-none absolute -right-24 top-44 h-80 w-80 rounded-full bg-[#FF653F]/20 blur-3xl dark:bg-[#FFC85C]/10" />
        </>
      ) : null}
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className={mainClassName}>{children}</main>
      <SiteFooter />
    </div>
  );
}
