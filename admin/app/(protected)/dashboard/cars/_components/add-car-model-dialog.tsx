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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type AddCarModelDialogProps = {
  open: boolean;
  modelName: string;
  onModelNameChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  error: string | null;
  mutation: Pick<UseMutationResult, "isPending">;
};

export function AddCarModelDialog({
  open,
  modelName,
  onModelNameChange,
  onOpenChange,
  onSubmit,
  error,
  mutation,
}: AddCarModelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add model</DialogTitle>
          <DialogDescription>
            This model will be added under Others and selected for the listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="add-car-model-name">Model</Label>
          <Input
            id="add-car-model-name"
            value={modelName}
            onChange={(e) => onModelNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            autoComplete="off"
            autoFocus
            maxLength={80}
          />
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not add model</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            type="button"
            disabled={mutation.isPending}
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
              "Add model"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
