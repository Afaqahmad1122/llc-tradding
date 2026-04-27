import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicReview } from "@/lib/api/reviews";

export function TestimonialGrid({ items }: { items: PublicReview[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_16px_42px_-28px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]"
        >
          <div className="h-1 w-full brand-gradient-warm" />
          <CardHeader>
            <CardTitle className="text-base text-[#1E104E] dark:text-white">
              {item.user.name}
            </CardTitle>
            <CardDescription className="text-[#452E5A]/75 dark:text-white/60">
              {item.country ?? "Country not shared"} • {item.rating.toFixed(1)} / 5
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-[#452E5A]/90 dark:text-white/75">
            &quot;{item.comment}&quot;
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
