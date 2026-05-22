"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import type { CarModelSummary } from "@/lib/api/cars";

import type { CarFormDraft, ImageDraftRow } from "../_lib/draft-utils";
import { CarFormFields } from "./car-form-fields";
import { ImageDraftSection } from "./image-draft-section";

type CarCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: CarFormDraft;
  onDraftChange: (patch: Partial<CarFormDraft>) => void;
  models: CarModelSummary[];
  images: ImageDraftRow[];
  onImagesChange: (next: ImageDraftRow[]) => void;
  uploadHint: string | null;
  createError: string | null;
  onSubmit: () => void;
  mutation: Pick<UseMutationResult, "isPending">;
};

export function CarCreateDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  models,
  images,
  onImagesChange,
  uploadHint,
  createError,
  onSubmit,
  mutation,
}: CarCreateDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden p-6 sm:max-w-lg md:max-w-xl lg:max-w-3xl"
      >
        <DialogHeader className="shrink-0 pr-10 sm:pr-12">
          <DialogTitle>Create listing</DialogTitle>
          <DialogDescription>
            Required fields: reference number, vehicle model, year, USD price,
            PKR price, and JPY price. Uploaded images show live previews below
            before you save.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-1">
          <CarFormFields
            idPrefix="create"
            draft={draft}
            onChange={onDraftChange}
            models={models}
          />
          <ImageDraftSection
            idPrefix="create"
            images={images}
            onChange={onImagesChange}
            uploadHint={uploadHint}
          />
          {createError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not create</AlertTitle>
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter className="mt-4 shrink-0 flex-wrap gap-2 border-border/60 border-t pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            className="inline-flex gap-2"
            onClick={onSubmit}
          >
            {mutation.isPending ? (
              <>
                <Spinner className="size-4" />
                Saving…
              </>
            ) : (
              "Create listing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
