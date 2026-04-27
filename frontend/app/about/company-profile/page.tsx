import { noticeText } from "@/components/landing/home-data";
import { NoticeBar } from "@/components/landing/sections/notice-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteNavbar } from "@/components/landing/site-navbar";

const officeAddresses = [
  {
    title: "Australia Office",
    lines: [
      "28 Elderwood Ave",
      "TRUGANINA VIC 3029, AUSTRALIA",
      "PH: 0415 136 181",
    ],
  },
  {
    title: "Japan Office",
    lines: [
      "3231102",
      "栃木県栃木市藤岡町赤麻字西原868番3",
      "株式会社ICC TRADING 御中",
      "323-1102",
      "Tochigi Ken, Tochigi Shi, Fujioka-cho, Akamaza, Nishihara 867-3, Japan",
      "ICC TRADING CO, LTD",
    ],
  },
  {
    title: "Pakistan Office",
    lines: [
      "Dean city tri building opposite to sarhad university",
      "4th floor, 402 office",
    ],
  },
];

export default function CompanyProfilePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-linear-to-b from-[#f8f5ff] via-[#f3ecff] to-[#fff7ef]">
      <NoticeBar text={noticeText} />
      <SiteNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-8 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)]">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] sm:text-4xl">
            Company Profile
          </h1>
          <p className="mt-3 max-w-3xl text-base text-[#452E5A]/85 sm:text-lg">
            ICC TRADING CO, LTD was established in 2002 and continues to serve
            customers with trusted international vehicle trading support.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {officeAddresses.map((office) => (
            <article
              key={office.title}
              className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6"
            >
              <h2 className="text-xl font-semibold text-[#1E104E]">
                {office.title}
              </h2>
              <div className="mt-3 space-y-1 text-sm text-[#452E5A]/90 sm:text-base">
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
