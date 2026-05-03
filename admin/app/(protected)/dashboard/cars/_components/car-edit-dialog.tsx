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
        className="flex max-h-[min(92dvh,52rem)] flex-col gap-0 overflow-hidden p-6 sm:max-w-lg md:max-w-xl lg:max-w-3xl"
      >
        <DialogHeader className="shrink-0 pr-10 sm:pr-12">
          <DialogTitle>
            Edit {editCar ? editCar.referenceNo : "car"}
          </DialogTitle>
          <DialogDescription>
            Reference numbers stay fixed for auditing. Updating images replaces
            the entire ordered set, with live preview before save.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto py-1">
          {draft ? (
            <CarFormFields
              idPrefix="edit"
              draft={draft}
              models={models}
              referenceReadOnly
              onChange={onDraftChange}
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
        <DialogFooter className="mt-4 shrink-0 flex-wrap gap-2 border-border/60 border-t pt-4">
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
