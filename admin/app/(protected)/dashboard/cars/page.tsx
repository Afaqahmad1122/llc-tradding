"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useEffect, useReducer, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  createAdminCar,
  fetchAdminCars,
  fetchAdminModels,
  presignCarImageUpload,
  replaceAdminCarImages,
  unpublishAdminCar,
  updateAdminCar,
  type AdminCar,
  type CreateAdminCarBody,
  type UpdateAdminCarBody,
} from "@/lib/api/cars";

import { CarCreateDialog } from "./_components/car-create-dialog";
import { CarEditDialog } from "./_components/car-edit-dialog";
import { CarUnpublishDialog } from "./_components/car-unpublish-dialog";
import { CarsListContent } from "./_components/cars-list-content";
import { CarsListToolbar } from "./_components/cars-list-toolbar";
import {
  adminImageToDraft,
  buildMutationBodyBase,
  carToDraft,
  draftToImageInputs,
  emptyCarDraft,
  formatErrorMessage,
  validateCarDraft,
  type CarFormDraft,
  type ImageDraftRow,
} from "./_lib/draft-utils";
import {
  buildCarsQuery,
  initialListState,
  listReducer,
} from "./_lib/list-state";

export default function AdminCarsPage() {
  const qc = useQueryClient();
  const [list, dispatch] = useReducer(listReducer, initialListState);

  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState(() => emptyCarDraft());
  const [createImages, setCreateImages] = useState<ImageDraftRow[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadHintShown, setUploadHintShown] = useState<string | null>(null);

  const [editCar, setEditCar] = useState<AdminCar | null>(null);
  const [editDraft, setEditDraft] = useState<CarFormDraft | null>(null);
  const [editImages, setEditImages] = useState<ImageDraftRow[]>([]);
  const [editError, setEditError] = useState<string | null>(null);

  const [dangerCar, setDangerCar] = useState<AdminCar | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      dispatch({
        type: "APPLY_DEBOUNCED_SEARCH",
        payload: list.searchInput.trim(),
      });
    }, 320);
    return () => window.clearTimeout(t);
  }, [list.searchInput]);

  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: [
      "admin-cars",
      list.page,
      list.pageSize,
      list.debouncedSearch,
      list.sort,
      list.published,
    ],
    queryFn: () => fetchAdminCars(buildCarsQuery(list)),
    placeholderData: keepPreviousData,
  });

  const { data: modelsData } = useQuery({
    queryKey: ["admin-car-models"],
    queryFn: () => fetchAdminModels(),
    staleTime: 5 * 60_000,
  });

  const models = modelsData?.models ?? [];

  const invalidateCars = () =>
    qc.invalidateQueries({
      predicate: (q) =>
        Array.isArray(q.queryKey) && q.queryKey[0] === "admin-cars",
    });

  const createMutation = useMutation({
    mutationFn: async () => {
      const msg = validateCarDraft(createDraft, createImages, true);
      if (msg) throw new Error(msg);

      try {
        const base = buildMutationBodyBase(createDraft);
        const filteredImages = draftToImageInputs(
          createImages.filter((x) => x.url.trim()),
        );
        await createAdminCar({
          ...(base as CreateAdminCarBody),
          ...(filteredImages.length > 0 ? { images: filteredImages } : {}),
        });
      } catch (e: unknown) {
        throw new Error(formatErrorMessage(e));
      }
    },
    onSuccess: () => {
      setCreateOpen(false);
      setCreateDraft(emptyCarDraft());
      setCreateImages([]);
      setCreateError(null);
      void invalidateCars();
    },
    onError: (e: unknown) => setCreateError(formatErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editCar || !editDraft) throw new Error("No car selected.");
      const msg = validateCarDraft(editDraft, editImages, false);
      if (msg) throw new Error(msg);

      try {
        const base = buildMutationBodyBase(editDraft) as Record<
          string,
          unknown
        >;
        delete base.referenceNo;
        Object.keys(base).forEach((k) => {
          if (base[k] === undefined) delete base[k];
        });

        await updateAdminCar(editCar.id, base as UpdateAdminCarBody);

        await replaceAdminCarImages(editCar.id, {
          images: draftToImageInputs(editImages.filter((x) => x.url.trim())),
        });
      } catch (e: unknown) {
        throw new Error(formatErrorMessage(e));
      }
    },
    onSuccess: () => {
      setEditCar(null);
      setEditDraft(null);
      setEditImages([]);
      setEditError(null);
      void invalidateCars();
    },
    onError: (e: unknown) => setEditError(formatErrorMessage(e)),
  });

  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      await unpublishAdminCar(id);
    },
    onSuccess: () => {
      setDangerCar(null);
      void invalidateCars();
    },
  });

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const editOpen = Boolean(editCar && editDraft);

  async function probePresignHint() {
    setUploadHintShown(null);
    try {
      await presignCarImageUpload({
        contentType: "image/png",
        ext: "png",
      });
      setUploadHintShown(
        "Direct uploads use a presigned bucket URL. Uploaded images resolve to HTTPS automatically.",
      );
    } catch (e: unknown) {
      if (e instanceof ApiError && e.statusCode === 503) {
        setUploadHintShown(
          "Image upload is not configured on the server — add image URLs manually or configure S3 for presigned uploads.",
        );
      }
    }
  }

  function openEdit(car: AdminCar) {
    setEditCar(car);
    setEditDraft(carToDraft(car));
    const sorted = [...car.images].sort((a, b) => a.position - b.position);
    setEditImages(sorted.map((img) => adminImageToDraft(img)));
    setEditError(null);
  }

  function dismissEdit() {
    setEditCar(null);
    setEditDraft(null);
    setEditImages([]);
    setEditError(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-10 pt-10 sm:px-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Cars</h1>
          <p className="text-muted-foreground text-sm">
            Create inventory listings. Only admins can mutate records; buyers
            see published cars only.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="gap-2"
          onClick={() => {
            setCreateOpen(true);
            setCreateDraft(emptyCarDraft(models[0]?.id ?? ""));
            setCreateImages([]);
            setCreateError(null);
            void probePresignHint();
          }}
        >
          <Plus className="size-4" aria-hidden />
          New listing
        </Button>
      </div>

      {models.length === 0 ? (
        <Alert variant="destructive">
          <AlertTitle>No vehicle models available</AlertTitle>
          <AlertDescription>
            Add rows to the Model table so you can attach inventory. The admin
            model list returns every configured model slug.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-xl border shadow-xs ring-1 ring-foreground/10">
        <CarsListToolbar list={list} dispatch={dispatch} />
        <CarsListContent
          list={list}
          dispatch={dispatch}
          isError={isError}
          error={error}
          isPending={isPending}
          isFetching={isFetching}
          hasStaleData={Boolean(data)}
          rows={rows}
          totalPages={totalPages}
          onEdit={openEdit}
          onUnpublishRequest={setDangerCar}
          unpublishMutation={unpublishMutation}
        />
      </div>

      <CarCreateDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateError(null);
            setUploadHintShown(null);
          }
        }}
        draft={createDraft}
        onDraftChange={(p) =>
          setCreateDraft((prev) => ({ ...prev, ...p }))
        }
        models={models}
        images={createImages}
        onImagesChange={setCreateImages}
        uploadHint={uploadHintShown}
        createError={createError}
        mutation={createMutation}
        onSubmit={() => {
          setCreateError(null);
          createMutation.mutate();
        }}
      />

      <CarEditDialog
        open={editOpen}
        onDismiss={dismissEdit}
        editCar={editCar}
        draft={editDraft}
        models={models}
        images={editImages}
        onImagesChange={setEditImages}
        editError={editError}
        mutation={updateMutation}
        onDraftChange={(p) =>
          setEditDraft((prev) => (prev ? { ...prev, ...p } : prev))
        }
        onSave={() => {
          setEditError(null);
          updateMutation.mutate();
        }}
      />

      <CarUnpublishDialog
        car={dangerCar}
        onOpenChange={(open) => {
          if (!open) {
            unpublishMutation.reset();
            setDangerCar(null);
          }
        }}
        mutation={unpublishMutation}
      />
    </div>
  );
}
