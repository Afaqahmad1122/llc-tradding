"use client";

import { ChevronsUpDown, SearchIcon } from "lucide-react";
import * as React from "react";

import type { CarModelSummary } from "@/lib/api/cars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

type CarModelComboboxProps = {
  id: string;
  models: CarModelSummary[];
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
};

export function CarModelCombobox({
  id,
  models,
  value,
  onChange,
  disabled,
}: CarModelComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const searchInputId = `${id}-search`;

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(searchInputId)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, searchInputId]);

  const selected = models.find((m) => m.id === value);

  const filtered = React.useMemo(() => {
    const q = normalize(query);
    if (!q) return models;
    return models.filter((m) => {
      const hay = normalize(`${m.brand} ${m.name} ${m.slug}`);
      return hay.includes(q);
    });
  }, [models, query]);

  const emptyList = models.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || emptyList}
          className={cn(
            "h-auto min-h-9 w-full justify-between border-border/70 px-2.5 py-2 text-left font-normal shadow-none hover:bg-muted/80 active:translate-y-0",
            !selected && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {emptyList
              ? "No models loaded — run vehicle seed"
              : selected
                ? `${selected.brand} — ${selected.name}`
                : "Search or choose a model…"}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) max-w-[min(100vw-1.5rem,24rem)] p-2"
      >
        <div className="flex flex-col gap-2">
          <div className="relative">
            <SearchIcon
              className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              id={searchInputId}
              type="search"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search brand or model…"
              className="h-9 border-border/70 bg-muted/20 pr-3 pl-9 shadow-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {/* stop wheel bubbling so the create-listing dialog scroll area does not eat it */}
          <div
            className="max-h-72 touch-pan-y overflow-y-auto overscroll-contain rounded-md border border-border/60"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-1" role="listbox">
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                  value === "" && "bg-accent/60",
                )}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Select a model…
              </button>
              {query.trim() !== "" && filtered.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                  No matching model.
                </p>
              ) : (
                filtered.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    aria-selected={value === m.id}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                      value === m.id && "bg-accent/60",
                    )}
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                  >
                    {m.brand} — {m.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
