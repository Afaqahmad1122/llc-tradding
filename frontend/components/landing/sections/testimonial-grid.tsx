import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicReview } from "@/lib/api/reviews";

export function TestimonialGrid({ items }: { items: PublicReview[] }) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return "U";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  };

  const toStars = (rating: number) => {
    const rounded = Math.max(0, Math.min(5, Math.round(rating)));
    return Array.from({ length: 5 }, (_, index) => (index < rounded ? "★" : "☆")).join("");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden rounded-2xl border border-[#452E5A]/15 bg-white/95 shadow-[0_18px_40px_-30px_rgba(30,16,78,0.75)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]/90"
        >
          <div className="h-1.5 w-full brand-gradient-warm" />
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#452E5A]/15 bg-[#f6f2ff] text-xs font-semibold tracking-wide text-[#2f1b59] dark:border-white/15 dark:bg-white/10 dark:text-white/90">
                  {getInitials(item.user.name)}
                </div>
                <div>
                  <CardTitle className="text-base text-[#1E104E] dark:text-white">
                    {item.user.name}
                  </CardTitle>
                  <CardDescription className="text-[#452E5A]/75 dark:text-white/60">
                    {item.country ?? "Country not shared"}
                  </CardDescription>
                </div>
              </div>
              <p className="text-xs font-semibold tracking-wide text-[#5e4b7c] dark:text-white/70">
                {item.rating.toFixed(1)} / 5
              </p>
            </div>
            <p className="text-sm leading-none tracking-[0.2em] text-amber-500 dark:text-amber-400">
              {toStars(item.rating)}
            </p>
          </CardHeader>
          <CardContent className="pb-5 pt-0 text-sm leading-relaxed text-[#452E5A]/90 dark:text-white/75">
            <p className="line-clamp-4">&quot;{item.comment}&quot;</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
