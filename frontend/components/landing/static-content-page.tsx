import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";

export function StaticContentPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-8 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)]">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[#452E5A]/85 sm:text-lg">
            {description}
          </p>
          <p className="mt-4 text-sm text-[#452E5A]/70">
            This page is static for now and will be connected to dynamic data in
            the next phase.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
