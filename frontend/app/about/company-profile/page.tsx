import { AboutPageShell } from "@/components/landing/about-page-shell";

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
    <AboutPageShell
      badge="Trusted Since 2002"
      title="Company Profile"
      subtitle="ICC TRADING CO, LTD has delivered trusted international vehicle trading services since 2002 with a global customer-first approach."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-[#452E5A]/75 dark:text-white/65">
            Established
          </p>
          <p className="mt-1 text-3xl font-bold text-[#1E104E] dark:text-white">
            2002
          </p>
        </article>
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-[#452E5A]/75 dark:text-white/65">
            International Offices
          </p>
          <p className="mt-1 text-3xl font-bold text-[#1E104E] dark:text-white">
            3
          </p>
        </article>
        <article className="rounded-2xl border border-[#452E5A]/15 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
          <p className="text-sm text-[#452E5A]/75 dark:text-white/65">
            Core Focus
          </p>
          <p className="mt-1 text-lg font-semibold text-[#1E104E] dark:text-white">
            Vehicle Trading
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
          {officeAddresses.map((office) => (
            <article
              key={office.title}
              className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
            >
              <h2 className="text-xl font-semibold text-[#1E104E] dark:text-white">
                {office.title}
              </h2>
              <div className="mt-3 space-y-1 text-sm text-[#452E5A]/90 sm:text-base dark:text-white/80">
                {office.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </article>
          ))}
      </div>
    </AboutPageShell>
  );
}
