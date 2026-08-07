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
import type { AdminCar, CarModelSummary } from "@/lib/api/cars";

import type { CarFormDraft, ImageDraftRow } from "../_lib/draft-utils";
import { CarFormFields } from "./car-form-fields";
import { ImageDraftSection } from "./image-draft-section";

type CarEditDialogProps = {
  open: boolean;
  onDismiss: () => void;
  editCar: AdminCar | null;
  draft: CarFormDraft | null;
  onDraftChange: (patch: Partial<CarFormDraft>) => void;
  models: CarModelSummary[];
  onCreateModel?: (name: string) => void;
  images: ImageDraftRow[];
  onImagesChange: (next: ImageDraftRow[]) => void;
  editError: string | null;
  onSave: () => void;
  mutation: Pick<UseMutationResult, "isPending">;
};

export function CarEditDialog({
  open,
  onDismiss,
  editCar,
  draft,
  onDraftChange,
  models,
  onCreateModel,
  images,
  onImagesChange,
  editError,
  onSave,
  mutation,
}: CarEditDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[min(94dvh,56rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg md:max-w-2xl lg:max-w-4xl"
      >
        <DialogHeader className="border-border/70 bg-muted/20 shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-xl font-semibold">
            Edit {editCar ? editCar.referenceNo : "car"}
          </DialogTitle>
          <DialogDescription className="max-w-2xl">
            Reference numbers must stay unique. Updating images replaces
            the entire ordered set, with live preview before save.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
          {draft ? (
            <CarFormFields
              idPrefix="edit"
              draft={draft}
              models={models}
              onChange={onDraftChange}
              onCreateModel={onCreateModel}
            />
          ) : null}
          <ImageDraftSection
            idPrefix="edit"
            images={images}
            onChange={onImagesChange}
            uploadHint={null}
          />
          {editError ? (
            <Alert variant="destructive">
              <AlertTitle>Update failed</AlertTitle>
              <AlertDescription>{editError}</AlertDescription>
            </Alert>
          ) : null}
        </div>
        <DialogFooter className="border-border/70 bg-background/95 shrink-0 flex-wrap gap-2 border-t px-5 py-4 sm:px-6">
          <Button variant="outline" type="button" onClick={onDismiss}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || !draft}
            className="inline-flex gap-2"
            onClick={onSave}
          >
            {mutation.isPending ? (
              <>
                <Spinner className="size-4" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
