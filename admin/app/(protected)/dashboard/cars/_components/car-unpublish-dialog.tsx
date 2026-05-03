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

type CarDeleteDialogProps = {
  car: AdminCar | null;
  onOpenChange: (open: boolean) => void;
  mutation: UseMutationResult<void, unknown, string>;
};

export function CarDeleteDialog({
  car,
  onOpenChange,
  mutation,
}: CarDeleteDialogProps) {
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
          <AlertDialogTitle>Delete listing permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            {car?.referenceNo} will be removed permanently. Any uploaded AWS
            images tied to removed keys are deleted as part of cleanup.
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
            {mutation.isPending ? "Deleting…" : "Delete permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
