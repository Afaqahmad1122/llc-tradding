import type { ReactNode } from "react";

export function MetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-muted/25 flex min-w-0 flex-col gap-1 rounded-lg border border-border/60 px-3 py-2.5">
      <p className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <div className="text-foreground min-w-0 wrap-break-word text-sm leading-snug">
        {children}
      </div>
    </div>
  );
}
