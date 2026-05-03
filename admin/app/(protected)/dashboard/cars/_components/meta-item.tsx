import type { ReactNode } from "react";

export function MetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-w-0 flex-col gap-1 rounded-lg border border-border/50 px-3 py-2.5">
      <p className="text-muted-foreground text-[11px] font-medium tracking-wide">
        {label}
      </p>
      <div className="text-foreground min-w-0 wrap-break-word text-sm font-medium leading-snug">
        {children}
      </div>
    </div>
  );
}
