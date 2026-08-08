"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Phone, Save, Smartphone } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { ApiError } from "@/lib/api/client";
import {
  fetchSiteSettings,
  updateSiteSettings,
  type UpdateSiteSettingsBody,
} from "@/lib/api/site-settings";

const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

function formatErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export function SiteContactSettingsCard() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<UpdateSiteSettingsBody | null>(null);

  const settingsQuery = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: fetchSiteSettings,
  });

  const form = draft ?? {
    contactEmail: settingsQuery.data?.settings.contactEmail ?? "",
    contactPhone: settingsQuery.data?.settings.contactPhone ?? "",
    whatsappNumber: settingsQuery.data?.settings.whatsappNumber ?? "",
  };

  const mutation = useApiMutation({
    mutationFn: updateSiteSettings,
    successToast: "Website contact settings updated.",
    onSuccess: () => {
      setDraft(null);
      void queryClient.invalidateQueries({ queryKey: SITE_SETTINGS_QUERY_KEY });
    },
  });

  const disabled =
    settingsQuery.isPending ||
    mutation.isPending ||
    !form.contactEmail.trim() ||
    !form.contactPhone.trim() ||
    !form.whatsappNumber.trim();

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Website contact settings</CardTitle>
        <CardDescription>
          Update the public email, call number, and WhatsApp number shown on the website.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {settingsQuery.isError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Could not load settings</AlertTitle>
            <AlertDescription>{formatErrorMessage(settingsQuery.error)}</AlertDescription>
          </Alert>
        ) : null}

        <form
          className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({
              contactEmail: form.contactEmail.trim(),
              contactPhone: form.contactPhone.trim(),
              whatsappNumber: form.whatsappNumber.trim(),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="site-contact-email">Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="site-contact-email"
                type="email"
                className="pl-9"
                value={form.contactEmail}
                onChange={(event) =>
                  setDraft((state) => ({
                    ...(state ?? form),
                    contactEmail: event.target.value,
                  }))
                }
                placeholder="icctradingjp@gmail.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-contact-phone">Contact number</Label>
            <div className="relative">
              <Phone className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="site-contact-phone"
                className="pl-9"
                value={form.contactPhone}
                onChange={(event) =>
                  setDraft((state) => ({
                    ...(state ?? form),
                    contactPhone: event.target.value,
                  }))
                }
                placeholder="+81 70-6436-2003"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-whatsapp-number">WhatsApp number</Label>
            <div className="relative">
              <Smartphone className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                id="site-whatsapp-number"
                className="pl-9"
                value={form.whatsappNumber}
                onChange={(event) =>
                  setDraft((state) => ({
                    ...(state ?? form),
                    whatsappNumber: event.target.value,
                  }))
                }
                placeholder="+81 70-6436-2003"
              />
            </div>
          </div>
          <Button type="submit" disabled={disabled} className="gap-2">
            {mutation.isPending || settingsQuery.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
