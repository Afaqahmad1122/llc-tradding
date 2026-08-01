import { randomUUID } from "node:crypto";
import type { Response } from "express";

export type AdminCarDetailViewEvent = {
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

type AdminCarEventStreamClient = {
  id: string;
  res: Response;
};

const clients = new Map<string, AdminCarEventStreamClient>();

const writeSseEvent = (
  res: Response,
  eventName: string,
  payload: unknown,
): void => {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const addAdminCarEventStreamClient = (res: Response): (() => void) => {
  const id = randomUUID();
  clients.set(id, { id, res });

  writeSseEvent(res, "connected", { connected: true });

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25_000);

  return () => {
    clearInterval(heartbeat);
    clients.delete(id);
  };
};

export const broadcastAdminCarDetailView = (
  payload: AdminCarDetailViewEvent,
): void => {
  for (const client of clients.values()) {
    writeSseEvent(client.res, "car-detail-view", payload);
  }
};
