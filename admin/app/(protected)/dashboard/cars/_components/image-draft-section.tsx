"use client";

import { ExternalLink, ImageOff, ImagePlus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, type ChangeEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { presignCarImageUpload } from "@/lib/api/cars";

import type { ImageDraftRow } from "../_lib/draft-utils";
import { mapFileToPresignParts } from "../_lib/presign-helpers";

type ImageDraftSectionProps = {
  idPrefix: string;
  images: ImageDraftRow[];
  onChange: (next: ImageDraftRow[]) => void;
  uploadHint: string | null;
};

export function ImageDraftSection({
  idPrefix,
  images,
  onChange,
  uploadHint,
}: ImageDraftSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [brokenPreviewByUid, setBrokenPreviewByUid] = useState<
    Record<string, boolean>
  >({});

  function updateImage(uid: string, patch: Partial<ImageDraftRow>) {
    const next = images.map((row) => (row.uid === uid ? { ...row, ...patch } : row));
    onChange(next);
    if (patch.url !== undefined) {
      setBrokenPreviewByUid((prev) => {
        if (!(uid in prev)) return prev;
        const copy = { ...prev };
        delete copy[uid];
        return copy;
      });
    }
  }

  function setPrimary(uid: string) {
    onChange(
      images.map((row) => ({
        ...row,
        isPrimary: row.uid === uid,
      })),
    );
  }

  async function handleFile(change: ChangeEvent<HTMLInputElement>) {
    const file = change.target.files?.[0];
    change.target.value = "";
    if (!file) return;
    const parts = mapFileToPresignParts(file);
    if (!parts) return;
    setUploadError(null);
    setUploadBusy(true);
    try {
      const presigned = await presignCarImageUpload(parts.body);
      const res = await fetch(presigned.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": parts.body.contentType,
        },
      });
      if (!res.ok) {
        throw new Error(`Upload failed (${res.status})`);
      }
      const nextUid = crypto.randomUUID();
      onChange([
        ...images.map((r) =>
          images.some((i) => i.isPrimary) ? r : { ...r, isPrimary: false },
        ),
        {
          uid: nextUid,
          url: presigned.publicUrl,
          key: presigned.key,
          altText: "",
          isPrimary: images.every((r) => !r.isPrimary),
        },
      ]);
      setUploadError(null);
    } catch (e: unknown) {
      setUploadError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
      throw e;
    } finally {
      setUploadBusy(false);
    }
  }

  function onUploadError(change: ChangeEvent<HTMLInputElement>) {
    void handleFile(change).catch((e: unknown) => {
      console.error(e);
    });
  }

  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <Label id={`${idPrefix}-imgs-label`}>Images</Label>
          <p className="text-muted-foreground text-xs">
            Uploads show a live preview. Use URL fields only when needed.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onUploadError}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={uploadBusy || images.length >= 30}
            onClick={() => inputRef.current?.click()}
          >
            {uploadBusy ? (
              <Spinner className="size-3.5" />
            ) : (
              <ImagePlus className="size-3.5" aria-hidden />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={images.length >= 30}
            onClick={() =>
              onChange([
                ...images,
                {
                  uid: crypto.randomUUID(),
                  url: "",
                  key: "",
                  altText: "",
                  isPrimary: images.length === 0,
                },
              ])
            }
          >
            <Plus className="size-3.5" aria-hidden />
            Add URL image
          </Button>
        </div>
      </div>
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span>
          {images.length.toLocaleString()} / 30 images
        </span>
      </div>
      {uploadHint ? (
        <Alert>
          <AlertTitle>Uploads</AlertTitle>
          <AlertDescription>{uploadHint}</AlertDescription>
        </Alert>
      ) : null}
      {uploadError ? (
        <Alert variant="destructive">
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      ) : null}
      <div
        className="space-y-3"
        role="list"
        aria-labelledby={`${idPrefix}-imgs-label`}
      >
        {images.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No images yet. Use upload (if configured) or add public image URLs.
          </p>
        ) : (
          images.map((row, index) => (
            <div
              role="listitem"
              key={row.uid}
              className="bg-card grid gap-3 rounded-lg border p-3 sm:grid-cols-[11rem_1fr]"
            >
              <div className="space-y-2">
                <div className="bg-muted relative overflow-hidden rounded-md border">
                  <div className="relative aspect-4/3 w-full">
                    {row.url.trim() && !brokenPreviewByUid[row.uid] ? (
                      <Image
                        src={row.url}
                        alt={row.altText || `Image preview ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="176px"
                        unoptimized
                        onError={() =>
                          setBrokenPreviewByUid((prev) => ({
                            ...prev,
                            [row.uid]: true,
                          }))
                        }
                      />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1 text-xs">
                        <ImageOff className="size-4" aria-hidden />
                        <span>No preview</span>
                      </div>
                    )}
                  </div>
                  {row.isPrimary ? (
                    <Badge className="absolute left-2 top-2" variant="secondary">
                      Primary
                    </Badge>
                  ) : null}
                </div>
                {row.url.trim() ? (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full gap-1"
                  >
                    <a href={row.url} target="_blank" rel="noopener noreferrer">
                      Open image
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Image #{index + 1}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`${idPrefix}-img-pr-${row.uid}`}
                        checked={row.isPrimary}
                        onCheckedChange={() => setPrimary(row.uid)}
                      />
                      <Label
                        htmlFor={`${idPrefix}-img-pr-${row.uid}`}
                        className="text-sm font-normal whitespace-nowrap"
                      >
                        Primary
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      aria-label="Remove row"
                      onClick={() =>
                        onChange(images.filter((r) => r.uid !== row.uid))
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}-img-alt-${row.uid}`}>
                    Alt text (optional)
                  </Label>
                  <Input
                    id={`${idPrefix}-img-alt-${row.uid}`}
                    value={row.altText}
                    onChange={(e) => updateImage(row.uid, { altText: e.target.value })}
                    placeholder="Front view, rear view, interior, etc."
                  />
                </div>

                <details className="rounded-md border p-3">
                  <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
                    Advanced: image source details
                  </summary>
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`${idPrefix}-img-url-${row.uid}`}>
                      Image URL
                    </Label>
                    <Input
                      id={`${idPrefix}-img-url-${row.uid}`}
                      value={row.url}
                      onChange={(e) => updateImage(row.uid, { url: e.target.value })}
                      placeholder="https://…"
                    />
                    {row.key ? (
                      <p className="text-muted-foreground font-mono text-xs">
                        key: {row.key}
                      </p>
                    ) : null}
                  </div>
                </details>
                {!row.url.trim() ? (
                  <p className="text-muted-foreground text-xs">
                    Add a URL or upload a file to display preview.
                  </p>
                ) : null}
                {brokenPreviewByUid[row.uid] ? (
                  <p className="text-destructive text-xs">
                    Preview could not load from this URL.
                  </p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
