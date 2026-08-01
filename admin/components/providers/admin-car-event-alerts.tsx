"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { API_BASE_URL } from "@/lib/api/client";
import { useAdminAuthStore } from "@/stores/auth-store";

type AdminCarDetailViewEvent = {
  eventId: string;
  carId: string;
  referenceNo: string;
  title: string | null;
  model: string;
  viewedAt: string;
  viewer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    country: string | null;
    city: string | null;
  } | null;
};

function buildApiUrl(path: string): URL {
  const url = new URL(API_BASE_URL);
  const basePath = url.pathname.replace(/\/+$/, "");
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  url.pathname = `${basePath}${targetPath}`;
  return url;
}

function buildStreamUrl(accessToken: string): string {
  const url = buildApiUrl("/cars/admin/analytics/events/stream");
  url.searchParams.set("accessToken", accessToken);
  return url.toString();
}

function isCarDetailViewEvent(value: unknown): value is AdminCarDetailViewEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<AdminCarDetailViewEvent>;
  const viewerIsValid =
    event.viewer === null ||
    (typeof event.viewer === "object" &&
      typeof event.viewer?.id === "string" &&
      typeof event.viewer.name === "string" &&
      typeof event.viewer.email === "string" &&
      (typeof event.viewer.phone === "string" || event.viewer.phone === null) &&
      (typeof event.viewer.country === "string" ||
        event.viewer.country === null) &&
      (typeof event.viewer.city === "string" || event.viewer.city === null));

  return (
    typeof event.eventId === "string" &&
    typeof event.carId === "string" &&
    typeof event.referenceNo === "string" &&
    typeof event.model === "string" &&
    typeof event.viewedAt === "string" &&
    (typeof event.title === "string" || event.title === null) &&
    viewerIsValid
  );
}

function buildCarLabel(event: AdminCarDetailViewEvent): string {
  return event.title ? `${event.model} - ${event.title}` : event.model;
}

function buildViewerDetail(
  viewer: NonNullable<AdminCarDetailViewEvent["viewer"]>,
): string {
  const parts = [viewer.email];
  const location = [viewer.city, viewer.country].filter(Boolean).join(", ");
  if (viewer.phone) parts.push(viewer.phone);
  if (location) parts.push(location);
  return parts.join(" | ");
}

export function AdminCarEventAlerts() {
  const accessToken = useAdminAuthStore((state) => state.accessToken);
  const hasBootstrapped = useAdminAuthStore((state) => state.hasBootstrapped);
  const hasCarsReadAccess = useAdminAuthStore((state) =>
    state.hasPermission("carsRead"),
  );

  useEffect(() => {
    if (!hasBootstrapped || !accessToken || !hasCarsReadAccess) return;

    const eventSource = new EventSource(buildStreamUrl(accessToken));
    let hasShownStreamError = false;

    eventSource.onerror = () => {
      console.warn("Admin car event stream disconnected or blocked.");
      if (!hasShownStreamError) {
        hasShownStreamError = true;
        toast.warning("Realtime car alerts are disconnected.");
      }
    };

    eventSource.addEventListener("car-detail-view", (message) => {
      try {
        const parsed = JSON.parse(message.data) as unknown;
        if (!isCarDetailViewEvent(parsed)) return;

        const carLabel = buildCarLabel(parsed);
        if (parsed.viewer) {
          toast.info(`${parsed.viewer.name} viewed car ${parsed.referenceNo}`, {
            description: `${carLabel} | ${buildViewerDetail(parsed.viewer)}`,
          });
          return;
        }

        toast.info(`Guest viewed car ${parsed.referenceNo}`, {
          description: carLabel,
        });
      } catch {
        /* Ignore malformed stream payloads. */
      }
    });

    return () => {
      eventSource.close();
    };
  }, [accessToken, hasBootstrapped, hasCarsReadAccess]);

  return null;
}
