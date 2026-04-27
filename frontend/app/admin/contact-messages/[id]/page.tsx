"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminRouteGuard } from "@/components/auth/admin-route-guard";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useAdminContactMessageDetailQuery } from "@/hooks/use-admin-contact-messages-query";
import { useAdminContactMessageMutation } from "@/hooks/use-admin-contact-message-mutation";
import { type ContactMessageStatus } from "@/lib/api/contact-messages";
import { ApiError } from "@/lib/api/client";

const statusBadgeClassMap: Record<ContactMessageStatus, string> = {
  NEW: "bg-sky-100 text-sky-700",
  IN_REVIEW: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  SPAM: "bg-rose-100 text-rose-700",
};

export default function AdminContactMessageDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const queryClient = useQueryClient();
  const updateMutation = useAdminContactMessageMutation();
  const [statusDraft, setStatusDraft] = useState<ContactMessageStatus | null>(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const { data, isLoading, isError, error, isFetching } = useAdminContactMessageDetailQuery(id);
  const message = data?.contactMessage;
  const status = statusDraft ?? message?.status ?? "NEW";
  const adminNote = adminNoteDraft ?? message?.adminNote ?? "";

  const handleSave = async () => {
    if (!id) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    try {
      await updateMutation.mutateAsync({
        id,
        status,
        adminNote: adminNote.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-message", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      setStatusDraft(null);
      setAdminNoteDraft(null);
      setActionSuccess("Message updated successfully.");
    } catch (mutationError) {
      if (mutationError instanceof ApiError) {
        setActionError(mutationError.message);
        return;
      }
      setActionError("Unable to update message right now.");
    }
  };

  return (
    <AdminRouteGuard>
      <LandingPageShell mainClassName="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-[#452E5A]/15 bg-white/85 p-6 shadow-[0_16px_42px_-26px_rgba(30,16,78,0.75)] dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#1E104E] dark:text-white sm:text-3xl">
              Contact Message Detail
            </h1>
            <Button asChild variant="outline">
              <Link href="/admin/contact-messages">Back to list</Link>
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              <p className="text-sm text-[#452E5A]/80 dark:text-white/70">Loading message...</p>
            ) : null}
            {isError ? (
              <p className="text-sm text-[#b42318]">
                {error.message || "Unable to load message details."}
              </p>
            ) : null}
          </div>

          {!isLoading && !isError && message ? (
            <div className="mt-4 space-y-5">
              <div className="grid gap-4 rounded-2xl border border-[#452E5A]/15 bg-white/85 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Name</p>
                  <p className="text-sm font-medium">{message.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Email</p>
                  <p className="text-sm font-medium">{message.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Phone</p>
                  <p className="text-sm font-medium">{message.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Status</p>
                  <Badge className={statusBadgeClassMap[message.status]}>{message.status}</Badge>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Country / City</p>
                  <p className="text-sm font-medium">
                    {[message.country, message.city].filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Company</p>
                  <p className="text-sm font-medium">{message.company || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Vehicle requirement</p>
                  <p className="text-sm font-medium">{message.vehicleRequirement || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Received at</p>
                  <p className="text-sm font-medium">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-semibold uppercase text-[#452E5A]/70 dark:text-white/60">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{message.message}</p>
              </div>

              <div className="rounded-2xl border border-[#452E5A]/15 bg-white/85 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-[#1E104E] dark:text-white">Admin review</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr]">
                  <NativeSelect
                    value={status}
                    onChange={(event) => setStatusDraft(event.target.value as ContactMessageStatus)}
                    disabled={updateMutation.isPending || isFetching}
                  >
                    <NativeSelectOption value="NEW">NEW</NativeSelectOption>
                    <NativeSelectOption value="IN_REVIEW">IN_REVIEW</NativeSelectOption>
                    <NativeSelectOption value="RESOLVED">RESOLVED</NativeSelectOption>
                    <NativeSelectOption value="SPAM">SPAM</NativeSelectOption>
                  </NativeSelect>
                  <Textarea
                    value={adminNote}
                    onChange={(event) => setAdminNoteDraft(event.target.value)}
                    placeholder="Internal note for admin team"
                    className="min-h-24"
                    disabled={updateMutation.isPending || isFetching}
                  />
                </div>

                {actionError ? <p className="mt-2 text-sm text-[#b42318]">{actionError}</p> : null}
                {actionSuccess ? <p className="mt-2 text-sm text-[#067647]">{actionSuccess}</p> : null}

                <div className="mt-3">
                  <Button onClick={handleSave} disabled={updateMutation.isPending || isFetching}>
                    {updateMutation.isPending ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </LandingPageShell>
    </AdminRouteGuard>
  );
}
