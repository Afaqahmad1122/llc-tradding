import { http } from "@/lib/api/http";

export type Job = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  type: string | null;
  description: string;
  applyEmail: string;
  createdAt: string;
};

export type JobsListResponse = {
  data: Job[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type ApplyJobResponse = {
  application: {
    id: string;
    jobId: string;
    userId: string;
    status: string;
    appliedAt: string;
  };
  applyEmail: string;
  jobTitle: string;
};

export type JobApplyStatusResponse = {
  hasApplied: boolean;
  application: {
    id: string;
    status: string;
    appliedAt: string;
  } | null;
};

export async function getJobs(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: "latest" | "oldest";
}): Promise<JobsListResponse> {
  return http.get<JobsListResponse>("/jobs", { params });
}

export async function applyJob(jobId: string, note?: string): Promise<ApplyJobResponse> {
  return http.post<ApplyJobResponse, { note?: string }>(`/jobs/${jobId}/apply`, {
    note,
  });
}

export async function getMyJobApplyStatus(jobId: string): Promise<JobApplyStatusResponse> {
  return http.get<JobApplyStatusResponse>(`/jobs/${jobId}/apply-status`);
}
