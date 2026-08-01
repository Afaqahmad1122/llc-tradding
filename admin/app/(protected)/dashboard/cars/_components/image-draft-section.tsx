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
import { uploadCarImage } from "@/lib/api/cars";

import type { ImageDraftRow } from "../_lib/draft-utils";
import { mapFileToPresignParts } from "../_lib/presign-helpers";

type ImageDraftSectionProps = {
  idPrefix: string;
  images: ImageDraftRow[];
  onChange: (next: ImageDraftRow[]) => void;
  uploadHint: string | null;
};

const MAX_IMAGES = 30;

export function ImageDraftSection({
  idPrefix,
  images,
  onChange,
  uploadHint,
}: ImageDraftSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
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

  async function handleFiles(change: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(change.target.files ?? []);
    change.target.value = "";
    if (selectedFiles.length === 0) return;

    const availableSlots = Math.max(0, MAX_IMAGES - images.length);
    if (availableSlots === 0) {
      setUploadError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }

    const acceptedFiles = selectedFiles
      .filter((file) => mapFileToPresignParts(file))
      .slice(0, availableSlots);
    const rejectedCount = selectedFiles.length - acceptedFiles.length;

    if (acceptedFiles.length === 0) {
      setUploadError(
        "Choose JPEG, PNG, or WebP images. No supported files were selected.",
      );
      return;
    }

    setUploadError(null);
    setUploadBusy(true);
    setUploadProgress({ current: 0, total: acceptedFiles.length });
    try {
      const uploadedRows: ImageDraftRow[] = [];
      const failedNames: string[] = [];

      for (let index = 0; index < acceptedFiles.length; index += 1) {
        const file = acceptedFiles[index]!;
        setUploadProgress({ current: index + 1, total: acceptedFiles.length });
        try {
          const uploaded = await uploadCarImage(file);
          uploadedRows.push({
            uid: crypto.randomUUID(),
            url: uploaded.publicUrl,
            key: uploaded.key,
            altText: "",
            isPrimary: false,
          });
        } catch {
          failedNames.push(file.name);
        }
      }

      if (uploadedRows.length === 0) {
        throw new Error("Upload failed. Please try again.");
      }

      const hasPrimary = images.some((row) => row.isPrimary);
      if (!hasPrimary) {
        uploadedRows[0] = { ...uploadedRows[0]!, isPrimary: true };
      }

      onChange([
        ...images.map((row) =>
          hasPrimary ? row : { ...row, isPrimary: false },
        ),
        ...uploadedRows,
      ]);

      const warnings: string[] = [];
      if (rejectedCount > 0) {
        warnings.push(
          `${rejectedCount} file${rejectedCount === 1 ? "" : "s"} skipped.`,
        );
      }
      if (failedNames.length > 0) {
        warnings.push(
          `${failedNames.length} upload${
            failedNames.length === 1 ? "" : "s"
          } failed.`,
        );
      }
      setUploadError(warnings.length > 0 ? warnings.join(" ") : null);
    } catch (e: unknown) {
      setUploadError(
        e instanceof Error ? e.message : "Upload failed. Please try again.",
      );
      throw e;
    } finally {
      setUploadBusy(false);
      setUploadProgress(null);
    }
  }

  function onUploadError(change: ChangeEvent<HTMLInputElement>) {
    void handleFiles(change).catch((e: unknown) => {
      console.error(e);
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/50 bg-muted/15 p-4 ring-1 ring-border/30 sm:p-5 dark:bg-muted/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <Label id={`${idPrefix}-imgs-label`} className="text-base font-semibold">
              Images
            </Label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {images.length.toLocaleString()} / {MAX_IMAGES}
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Uploads show a live preview. Use URL fields only when needed.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onUploadError}
        />
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 border-border/70 shadow-none active:translate-y-0"
            disabled={uploadBusy || images.length >= MAX_IMAGES}
            onClick={() => inputRef.current?.click()}
          >
            {uploadBusy ? (
              <Spinner className="size-3.5" />
            ) : (
              <ImagePlus className="size-3.5" aria-hidden />
            )}
            {uploadProgress
              ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
              : "Upload"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1 border-border/70 shadow-none active:translate-y-0"
            disabled={images.length >= MAX_IMAGES}
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
      {uploadHint ? (
        <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 dark:bg-background/40">
          <p className="text-sm font-medium">Uploads</p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            {uploadHint}
          </p>
        </div>
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
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 py-10 text-center dark:bg-muted/5">
            <p className="text-muted-foreground mx-auto max-w-md text-sm text-pretty leading-relaxed">
              No images yet. Use upload (if configured) or add public image URLs.
            </p>
          </div>
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
                    className="w-full gap-1 border-border/70 shadow-none active:translate-y-0"
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
                      placeholder="https://cdn.example.com/vehicles/front.jpg"
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
