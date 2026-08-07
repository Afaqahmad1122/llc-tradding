import { Download, FileCheck2, FileClock, FileText, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  dashboardDocuments,
  documentStatusStyles,
} from "@/components/dashboard/user-dashboard-data";
import { cn } from "@/lib/utils";

const documentIcons = {
  Ready: FileCheck2,
  Pending: FileClock,
  Review: FileText,
};

export function DashboardDocuments() {
  return (
    <div className="space-y-5">
      <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-4 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E104E] dark:text-white">
              Order documents
            </h2>
            <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
              Export files and shipment paperwork shared by ICC operations.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7a6798]" />
            <Input
              className="h-10 rounded-[6px] border-[#452E5A]/15 pl-9"
              placeholder="Search documents"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dashboardDocuments.map((document) => {
          const Icon = documentIcons[document.status];
          const isReady = document.status === "Ready";

          return (
            <article
              key={`${document.title}-${document.orderNumber}`}
              className="rounded-[8px] border border-[#452E5A]/12 bg-white p-5 shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-[6px] bg-[#f4efff] text-[#452E5A] dark:bg-white/10 dark:text-white">
                  <Icon className="size-5" />
                </span>
                <Badge
                  variant="outline"
                  className={cn("h-6 rounded-full border px-2.5", documentStatusStyles[document.status])}
                >
                  {document.status}
                </Badge>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-semibold text-[#1E104E] dark:text-white">
                  {document.title}
                </h3>
                <p className="mt-1 text-sm text-[#6a5a84] dark:text-white/60">
                  {document.orderNumber}
                </p>
                <p className="mt-4 text-sm text-[#6a5a84] dark:text-white/60">
                  Updated: {document.updatedAt}
                </p>
              </div>

              <Button
                className="mt-5 h-10 w-full rounded-[6px]"
                variant={isReady ? "default" : "outline"}
                disabled={!isReady}
              >
                <Download className="size-4" />
                {isReady ? "Download" : "Not available yet"}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
