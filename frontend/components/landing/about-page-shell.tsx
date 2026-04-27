import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";

type AboutPageShellProps = {
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AboutPageShell({
  badge,
  title,
  subtitle,
  children,
}: AboutPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef] dark:from-[#0b0720] dark:via-[#120b2b] dark:to-[#1b1037]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-linear-to-r from-[#201156] via-[#2f235f] to-[#d14041] px-6 py-12 text-white shadow-[0_25px_65px_-30px_rgba(30,16,78,0.95)] sm:px-10">
          <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-0 h-52 w-52 rounded-full bg-[#ffb493]/25 blur-3xl" />
          <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
            {badge}
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/90 sm:text-xl">
            {subtitle}
          </p>
        </section>

        <section className="mt-8">{children}</section>
      </main>

      <SiteFooter />
    </div>
  );
}
