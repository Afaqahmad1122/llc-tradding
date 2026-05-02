"use client";

import type { UseMutationResult } from "@tanstack/react-query";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AdminCar } from "@/lib/api/cars";

import { formatErrorMessage } from "../_lib/draft-utils";

type CarUnpublishDialogProps = {
  car: AdminCar | null;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<void, unknown, string>;
};

export function CarUnpublishDialog({
  car,
  onOpenChange,
  mutation,
}: CarUnpublishDialogProps) {
  const open = Boolean(car);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          mutation.reset();
        }
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unpublish listing?</AlertDialogTitle>
          <AlertDialogDescription>
            {car?.referenceNo} will disappear from public inventory until you
            publish it again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {mutation.error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {formatErrorMessage(mutation.error)}
            </AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            type="button"
            disabled={mutation.isPending || car?.id === undefined}
            onClick={(e) => {
              e.preventDefault();
              const id = car?.id;
              if (!id) return;
              mutation.mutate(id);
            }}
          >
            {mutation.isPending ? "Working…" : "Unpublish"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
