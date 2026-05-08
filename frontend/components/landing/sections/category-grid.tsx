import { CategoryItem } from "@/components/landing/home-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function CategoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#452E5A]/10 bg-white animate-pulse dark:border-white/10 dark:bg-[#150e2e]">
      <div className="h-1 w-full bg-linear-to-r from-[#FF653F]/40 to-[#FFC85C]/40" />
      <div className="p-4 pb-2">
        <div className="h-4 w-28 rounded bg-[#452E5A]/10 dark:bg-white/10" />
        <div className="mt-2 h-3 w-20 rounded bg-[#452E5A]/8 dark:bg-white/8" />
      </div>
      <div className="px-4 pb-4">
        <div className="h-8 w-16 rounded-full bg-[#FFF4EF] dark:bg-[#FF653F]/10" />
      </div>
    </div>
  );
}

export function CategoryGrid({ items }: { items: CategoryItem[] | null }) {
  if (items === null) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CategoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.name}
          className="overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_14px_35px_-22px_rgba(30,16,78,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF653F]/45 dark:border-white/10 dark:bg-[#150e2e]"
        >
          <div className="h-1 w-full brand-gradient-warm" />
          <CardHeader className="pb-2 pt-3 px-3 sm:px-6 sm:pt-6 sm:pb-4">
            <CardTitle className="text-sm sm:text-base text-[#1E104E] dark:text-white leading-tight">
              {item.name}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-[#452E5A]/75 dark:text-white/60">
              Available listings
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <div className="inline-flex rounded-full border border-[#FF653F]/30 bg-[#FFF4EF] px-2.5 py-1 text-lg sm:text-2xl font-semibold text-[#1E104E] dark:border-[#FF653F]/40 dark:bg-[#FF653F]/10 dark:text-white">
              {item.count.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
