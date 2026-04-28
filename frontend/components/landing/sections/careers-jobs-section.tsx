"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BriefcaseBusiness, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-query";
import { ApiError } from "@/lib/api/client";
import { applyJob, getJobs, getMyJobApplyStatus, type Job } from "@/lib/api/jobs";
import { CONTACT_EMAIL } from "@/lib/contact-info";
import { useAuthStore } from "@/stores/auth-store";

const openApplyEmail = (job: Job, applyEmail: string): void => {
  const safeEmail = applyEmail || CONTACT_EMAIL;
  const subject = encodeURIComponent(`Application for ${job.title}`);
  const body = encodeURIComponent(
    `Hello,\n\nI am applying for the ${job.title} role.\nPlease find my CV attached.\n\nThank you.`,
  );
  window.location.href = `mailto:${safeEmail}?subject=${subject}&body=${body}`;
};

export function CareersJobsSection() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [appliedJobIds, setAppliedJobIds] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const jobsQuery = useApiQuery({
    queryKey: ["careers-jobs"],
    queryFn: () => getJobs({ page: 1, pageSize: 50, sort: "latest" }),
  });

  const jobs = useMemo(() => jobsQuery.data?.data ?? [], [jobsQuery.data?.data]);

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!isAuthenticated || jobs.length === 0) {
        return;
      }
      const statuses = await Promise.all(
        jobs.map(async (job) => {
          const status = await getMyJobApplyStatus(job.id);
          return [job.id, status.hasApplied] as const;
        }),
      );
      setAppliedJobIds(Object.fromEntries(statuses));
    };

    fetchStatuses().catch(() => undefined);
  }, [isAuthenticated, jobs]);

  const applyMutation = useApiMutation({
    mutationFn: ({ jobId }: { jobId: string }) => applyJob(jobId),
    onSuccess: (result) => {
      setAppliedJobIds((current) => ({
        ...current,
        [result.application.jobId]: true,
      }));
      const appliedJob = jobs.find((item) => item.id === result.application.jobId);
      if (appliedJob) {
        openApplyEmail(appliedJob, result.applyEmail);
      }
    },
    onError: (error, variables) => {
      if (error instanceof ApiError && error.statusCode === 409) {
        setAppliedJobIds((current) => ({
          ...current,
          [variables.jobId]: true,
        }));
        setActionError("You have already applied to this job.");
        return;
      }
      setActionError(error.message);
    },
  });

  const applyingJobId = useMemo(
    () => (applyMutation.variables ? applyMutation.variables.jobId : null),
    [applyMutation.variables],
  );

  const onApply = (job: Job) => {
    setActionError(null);
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (appliedJobIds[job.id]) {
      setActionError("You have already applied to this job.");
      return;
    }
    applyMutation.mutate({ jobId: job.id });
  };

  if (jobsQuery.isLoading) {
    return <p className="text-sm text-[#2F2142]/70 dark:text-white/70">Loading jobs...</p>;
  }

  if (jobsQuery.isError) {
    return (
      <p className="text-sm font-medium text-[#EA3B58]">
        Unable to load jobs right now. Please try again.
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EA3B58]">
          Careers
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E104E] dark:text-white">
          Join ICC Trading
        </h1>
        <p className="text-sm text-[#2F2142]/75 dark:text-white/75">
          Apply once per role. We will open your email client after recording your
          application so you can send your CV.
        </p>
      </div>

      {actionError ? (
        <p className="mb-4 text-sm font-medium text-[#EA3B58]">{actionError}</p>
      ) : null}

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-[#2F2142]/70 dark:text-white/70">
            No open roles at the moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => {
            const isApplied = Boolean(appliedJobIds[job.id]);
            const isSubmitting = applyMutation.isPending && applyingJobId === job.id;
            return (
              <Card key={job.id}>
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-start justify-between gap-3 text-lg text-[#1E104E] dark:text-white">
                    <span>{job.title}</span>
                    <BriefcaseBusiness className="size-5 text-[#EA3B58]" />
                  </CardTitle>
                  <p className="text-xs text-[#2F2142]/75 dark:text-white/70">
                    {[job.location, job.type].filter(Boolean).join(" • ") || "Open role"}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-[#2F2142]/85 dark:text-white/80">
                    {job.description}
                  </p>
                  <Button
                    type="button"
                    disabled={isApplied || isSubmitting}
                    onClick={() => onApply(job)}
                    className="w-full border-0 bg-linear-to-r from-[#FF653F] to-[#FFC85C] text-[#1E104E] hover:opacity-90"
                  >
                    <Mail className="size-4" />
                    {isApplied
                      ? "Already Applied"
                      : isSubmitting
                        ? "Applying..."
                        : "Apply Job"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
