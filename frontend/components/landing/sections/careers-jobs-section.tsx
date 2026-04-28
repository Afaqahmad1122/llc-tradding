"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BriefcaseBusiness, Mail, MapPin, Sparkles } from "lucide-react";
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
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-[#EA3B58]/30 bg-linear-to-r from-[#c91933] to-[#de2b45] px-6 py-12 text-white shadow-xl sm:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
            Careers
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Ignite Your Challenger Spirit
          </h1>
          <p className="mt-3 text-sm text-white/90 sm:text-base">
            Build your career with ICC Trading. Apply once per role, then send your
            CV by email after application is recorded.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-6 rounded-3xl border border-[#452E5A]/10 bg-white/80 p-5 shadow-lg backdrop-blur sm:p-8 lg:grid-cols-[1.2fr_0.8fr] dark:border-white/10 dark:bg-white/5">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#EA3B58]/20 bg-white px-5 py-4 text-xl leading-relaxed font-semibold text-[#1E104E] shadow-sm dark:border-[#EA3B58]/40 dark:bg-white/10 dark:text-white sm:text-2xl">
            ICC Trading Japan takes pride in being a leading name in the industry,
            specializing in the seamless global distribution of high-quality vehicles.
          </div>
          <p className="text-base leading-8 text-[#2F2142]/85 dark:text-white/80">
            Joining our team means becoming part of a culture built on
            professionalism, integrity, and impact. We actively seek people who are
            forward-thinking and committed to exceptional service.
          </p>
          <p className="text-base leading-8 text-[#2F2142]/85 dark:text-white/80">
            Explore open positions below and apply using the button on each role.
            Once your application is accepted in the system, your email client opens
            so you can send your CV directly.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[#452E5A]/10 bg-white/70 dark:border-white/10 dark:bg-white/10">
          <Image
            src="/bernardsie-honda-1596081_1920.png"
            alt="Team collaboration"
            width={700}
            height={480}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-12 mb-6 space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#EA3B58]/25 bg-[#fff3f6] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#EA3B58] dark:bg-white/10 dark:text-[#ff8ca2]">
          <Sparkles className="size-3.5" />
          Open Positions
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight text-[#1E104E] dark:text-white">
          Find Your Next Role
        </h2>
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const isApplied = Boolean(appliedJobIds[job.id]);
            const isSubmitting = applyMutation.isPending && applyingJobId === job.id;
            return (
              <Card
                key={job.id}
                className="border-[#452E5A]/10 bg-white/90 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
              >
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-start justify-between gap-3 text-2xl font-bold leading-tight text-[#1E104E] dark:text-white">
                    <span>{job.title}</span>
                    <BriefcaseBusiness className="mt-1 size-5 text-[#EA3B58]" />
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {job.type ? (
                      <span className="rounded-full bg-[#e8f4ff] px-2.5 py-1 font-semibold text-[#0e72b8] dark:bg-[#18486b]/50 dark:text-[#9fd9ff]">
                        {job.type}
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[#f3edf9] px-2.5 py-1 font-semibold text-[#6d3ea8] dark:bg-[#3b2857]/60 dark:text-[#dab9ff]">
                      Careers
                    </span>
                    {job.location ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#edf7ef] px-2.5 py-1 font-semibold text-[#357a49] dark:bg-[#1f4e31]/60 dark:text-[#b7efc5]">
                        <MapPin className="size-3" />
                        {job.location}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-4 min-h-24 text-sm leading-7 text-[#2F2142]/85 dark:text-white/80">
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
