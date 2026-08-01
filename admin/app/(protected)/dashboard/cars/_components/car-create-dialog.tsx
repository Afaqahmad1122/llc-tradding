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
  onCreateModel?: (name: string) => void;
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
  onCreateModel,
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
        className="flex max-h-[min(94dvh,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
      >
        <DialogHeader className="border-border/70 bg-muted/20 shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-xl font-semibold">
            Create listing
          </DialogTitle>
          <DialogDescription className="max-w-2xl">
            Reference number, model, and year are required. Leave prices empty
            to show Ask on the public listing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
          <CarFormFields
            idPrefix="create"
            draft={draft}
            onChange={onDraftChange}
            models={models}
            onCreateModel={onCreateModel}
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
        <DialogFooter className="border-border/70 bg-background/95 shrink-0 flex-wrap gap-2 border-t px-5 py-4 sm:px-6">
          <Button
            variant="outline"
            type="button"
            className="h-10 rounded-[4px] px-4"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending}
            className="inline-flex h-10 gap-2 rounded-[4px] px-4"
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
