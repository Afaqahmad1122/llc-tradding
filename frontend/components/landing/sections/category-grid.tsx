import { CategoryItem } from "@/components/landing/home-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryGrid({ items }: { items: CategoryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.name}
          className="overflow-hidden border-[#452E5A]/15 bg-white shadow-[0_14px_35px_-22px_rgba(30,16,78,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FF653F]/45"
        >
          <div className="h-1 w-full brand-gradient-warm" />
          <CardHeader>
            <CardTitle className="text-base text-[#1E104E]">
              {item.name}
            </CardTitle>
            <CardDescription className="text-[#452E5A]/75">
              Available listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="inline-flex rounded-full border border-[#FF653F]/30 bg-[#FFF4EF] px-3 py-1 text-2xl font-semibold text-[#1E104E]">
              {item.count}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
