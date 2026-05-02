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
        className="gap-5 sm:max-w-lg md:max-w-xl lg:max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle>Create listing</DialogTitle>
          <DialogDescription>
            Required fields: reference number, vehicle model, year, and USD
            price. Unpublished cars stay invisible on the public site.
          </DialogDescription>
        </DialogHeader>
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
        <DialogFooter className="flex-wrap gap-2">
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
