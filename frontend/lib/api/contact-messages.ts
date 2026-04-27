import { http } from "@/lib/api/http";

export type ContactMessageStatus = "NEW" | "IN_REVIEW" | "RESOLVED" | "SPAM";

export type SubmitContactMessageRequest = {
  name: string;
  email: string;
  phone: string;
  country?: string;
  city?: string;
  company?: string;
  vehicleRequirement?: string;
  message: string;
};

export type ContactMessageAdminItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string | null;
  city: string | null;
  company: string | null;
  vehicleRequirement: string | null;
  message: string;
  status: ContactMessageStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
};

export type ContactMessagesListParams = {
  page?: number;
  pageSize?: number;
  status?: ContactMessageStatus;
  search?: string;
  sort?: "latest" | "oldest";
};

export type ContactMessagesListResponse = {
  data: ContactMessageAdminItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type SubmitContactMessageResponse = {
  message: string;
  contactMessage: {
    id: string;
    status: ContactMessageStatus;
    createdAt: string;
  };
};

type ContactMessageDetailResponse = {
  contactMessage: ContactMessageAdminItem;
};

type UpdateContactMessageRequest = {
  status?: ContactMessageStatus;
  adminNote?: string;
};

export const submitContactMessageApi = (payload: SubmitContactMessageRequest) =>
  http.post<SubmitContactMessageResponse, SubmitContactMessageRequest>(
    "/contact-messages",
    payload,
  );

export const getAdminContactMessagesApi = (params: ContactMessagesListParams) =>
  http.get<ContactMessagesListResponse>("/contact-messages/admin", {
    params,
  });

export const getAdminContactMessageByIdApi = (id: string) =>
  http.get<ContactMessageDetailResponse>(`/contact-messages/admin/${id}`);

export const updateAdminContactMessageApi = (
  id: string,
  payload: UpdateContactMessageRequest,
) =>
  http.patch<ContactMessageDetailResponse, UpdateContactMessageRequest>(
    `/contact-messages/admin/${id}`,
    payload,
  );
