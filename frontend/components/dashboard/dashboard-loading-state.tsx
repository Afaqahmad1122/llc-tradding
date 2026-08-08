import { Spinner } from "@/components/ui/spinner";

export function DashboardLoadingState({ message }: { message: string }) {
  return (
    <div className="rounded-[8px] border border-[#452E5A]/12 bg-white p-8 text-center text-sm text-[#6a5a84] shadow-sm shadow-[#2e1e56]/5 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
      <span className="inline-flex items-center gap-2">
        <Spinner className="size-4" />
        {message}
      </span>
    </div>
  );
}
