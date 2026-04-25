import { TestimonialItem } from "@/components/landing/home-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TestimonialGrid({ items }: { items: TestimonialItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card
          key={item.name}
          className="overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_16px_42px_-28px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-[#150e2e]"
        >
          <div className="h-1 w-full brand-gradient-warm" />
          <CardHeader>
            <CardTitle className="text-base text-[#1E104E] dark:text-white">
              {item.name}
            </CardTitle>
            <CardDescription className="text-[#452E5A]/75 dark:text-white/60">
              {item.country} • {item.rating}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-[#452E5A]/90 dark:text-white/75">
            &quot;{item.quote}&quot;
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
