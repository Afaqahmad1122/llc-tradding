"use client";

import { ImagePlus, Plus, X } from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
        <Label id={`${idPrefix}-imgs-label`}>Images</Label>
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
            Add URL row
          </Button>
        </div>
      </div>
      {uploadHint ? (
        <Alert>
          <AlertTitle>Uploads</AlertTitle>
          <AlertDescription>{uploadHint}</AlertDescription>
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
              className="bg-card flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start"
            >
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${idPrefix}-img-url-${row.uid}`}>
                    Image URL #{index + 1}
                  </Label>
                  <Input
                    id={`${idPrefix}-img-url-${row.uid}`}
                    value={row.url}
                    onChange={(e) =>
                      onChange(
                        images.map((r) =>
                          r.uid === row.uid ? { ...r, url: e.target.value } : r,
                        ),
                      )
                    }
                    placeholder="https://…"
                  />
                  {row.key ? (
                    <p className="text-muted-foreground font-mono text-xs">
                      key: {row.key}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor={`${idPrefix}-img-alt-${row.uid}`}>
                    Alt text (optional)
                  </Label>
                  <Input
                    id={`${idPrefix}-img-alt-${row.uid}`}
                    value={row.altText}
                    onChange={(e) =>
                      onChange(
                        images.map((r) =>
                          r.uid === row.uid
                            ? { ...r, altText: e.target.value }
                            : r,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-stretch">
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
          ))
        )}
      </div>
    </div>
  );
}
