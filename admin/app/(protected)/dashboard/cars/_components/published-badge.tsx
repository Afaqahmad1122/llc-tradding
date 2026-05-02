import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 border font-medium tabular-nums",
        isPublished
          ? "border-emerald-500/45 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200"
          : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
      )}
    >
      {isPublished ? "Live" : "Hidden"}
    </Badge>
  );
}
