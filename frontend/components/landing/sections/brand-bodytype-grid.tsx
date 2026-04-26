import Image from "next/image";
import Link from "next/link";

import type { LogoNavItem } from "@/components/landing/home-data";

type BrandBodyTypeGridProps = {
  brands: LogoNavItem[];
  bodyTypes: LogoNavItem[];
};

function NavGrid({ title, items }: { title: string; items: LogoNavItem[] }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xl font-semibold text-[#1E104E] dark:text-white">
        {title}
      </h3>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-[#452E5A]/14 bg-white p-2.5 shadow-[0_8px_24px_-16px_rgba(30,16,78,0.6)] transition-colors hover:border-[#FF653F]/45 hover:bg-[#FFF9F5] dark:border-white/10 dark:bg-[#150e2e] dark:hover:border-[#FFC85C]/45 dark:hover:bg-[#1b1240]"
            aria-label={`Browse ${item.name}`}
          >
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-sm border border-[#452E5A]/10 bg-white dark:border-white/10 dark:bg-white/5">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-contain p-1"
                sizes="56px"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#1E104E] dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-[#452E5A]/75 dark:text-white/60">
                ({item.count.toLocaleString()})
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BrandBodyTypeGrid({
  brands,
  bodyTypes,
}: BrandBodyTypeGridProps) {
  return (
    <div className="space-y-8">
      <NavGrid title="Browse by car brand" items={brands} />
      <NavGrid title="Browse by Body Type" items={bodyTypes} />
    </div>
  );
}
