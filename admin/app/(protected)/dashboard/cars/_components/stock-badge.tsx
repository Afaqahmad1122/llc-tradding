import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 border font-medium tabular-nums",
        inStock
          ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      {inStock ? "In stock" : "Out of stock"}
    </Badge>
  );
}
