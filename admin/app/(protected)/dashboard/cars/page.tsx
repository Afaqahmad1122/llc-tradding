"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CarFront, Plus } from "lucide-react";
import { useEffect, useReducer, useState } from "react";

import { PermissionGuard } from "@/components/auth/permission-guard";
import { useAdminAuthStore } from "@/stores/auth-store";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  createAdminCar,
  createAdminModel,
  fetchAdminCars,
  fetchAdminModels,
  deleteAdminCar,
  replaceAdminCarImages,
  updateAdminCar,
  type AdminCar,
  type CarModelSummary,
  type CreateAdminCarBody,
  type UpdateAdminCarBody,
} from "@/lib/api/cars";

import { AddCarModelDialog } from "./_components/add-car-model-dialog";
import { CarCreateDialog } from "./_components/car-create-dialog";
import { CarEditDialog } from "./_components/car-edit-dialog";
import { CarDeleteDialog } from "./_components/car-unpublish-dialog";
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

type AddModelTarget = "create" | "edit";

function AdminCarsPageContent() {
  const qc = useQueryClient();
  const hasPermission = useAdminAuthStore((state) => state.hasPermission);
  const canCreateCars = hasPermission("carsCreate");
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

  const [addModelTarget, setAddModelTarget] =
    useState<AddModelTarget | null>(null);
  const [addModelName, setAddModelName] = useState("");
  const [addModelError, setAddModelError] = useState<string | null>(null);

  const [deleteCarCandidate, setDeleteCarCandidate] = useState<AdminCar | null>(
    null,
  );

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

  const updateModelsCache = (model: CarModelSummary) => {
    qc.setQueryData<{ models: CarModelSummary[] }>(
      ["admin-car-models"],
      (current) => {
        const existing = current?.models ?? [];
        const next = existing.some((m) => m.id === model.id)
          ? existing.map((m) => (m.id === model.id ? model : m))
          : [...existing, model];

        next.sort(
          (a, b) =>
            a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name),
        );

        return { models: next };
      },
    );
  };

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
      const msg = validateCarDraft(editDraft, editImages, true);
      if (msg) throw new Error(msg);

      try {
        const base = buildMutationBodyBase(editDraft) as Record<
          string,
          unknown
        >;
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteAdminCar(id);
    },
    onSuccess: () => {
      setDeleteCarCandidate(null);
      void invalidateCars();
    },
  });

  const createModelMutation = useMutation({
    mutationFn: async (name: string) => {
      const cleanName = name.trim();
      if (!cleanName) throw new Error("Model name is required.");

      try {
        return await createAdminModel({ name: cleanName });
      } catch (e: unknown) {
        throw new Error(formatErrorMessage(e));
      }
    },
    onSuccess: ({ model }) => {
      updateModelsCache(model);
      if (addModelTarget === "create") {
        setCreateDraft((prev) => ({ ...prev, modelId: model.id }));
      }
      if (addModelTarget === "edit") {
        setEditDraft((prev) => (prev ? { ...prev, modelId: model.id } : prev));
      }
      setAddModelTarget(null);
      setAddModelName("");
      setAddModelError(null);
      void qc.invalidateQueries({ queryKey: ["admin-car-models"] });
    },
    onError: (e: unknown) => setAddModelError(formatErrorMessage(e)),
  });

  const rows = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;
  const totalItems = data?.pagination.total ?? 0;
  const editOpen = Boolean(editCar && editDraft);

  function showUploadHint() {
    setUploadHintShown(
      "Uploads are sent through the backend and stored in S3. Uploaded images resolve to HTTPS automatically.",
    );
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

  function openAddModelDialog(target: AddModelTarget, name: string) {
    setAddModelTarget(target);
    setAddModelName(name.trim());
    setAddModelError(null);
    createModelMutation.reset();
  }

  function handleAddModelOpenChange(open: boolean) {
    if (!open) {
      setAddModelTarget(null);
      setAddModelName("");
      setAddModelError(null);
      createModelMutation.reset();
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 sm:px-7 sm:pt-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className="bg-primary/12 text-primary ring-primary/15 flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1"
            aria-hidden
          >
            <CarFront className="size-6" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground max-w-xl text-pretty text-sm leading-relaxed">
              Manage vehicle listings. Edits here stay in admin until you
              publish — buyers only see live listings.
            </p>
          </div>
        </div>
        {canCreateCars ? (
          <Button
            type="button"
            size="default"
            className="gap-2 self-start sm:self-center"
            onClick={() => {
              setCreateOpen(true);
              setCreateDraft(emptyCarDraft(models[0]?.id ?? ""));
              setCreateImages([]);
              setCreateError(null);
              showUploadHint();
            }}
          >
            <Plus className="size-4" aria-hidden />
            New listing
          </Button>
        ) : null}
      </header>

      {models.length === 0 ? (
        <Alert variant="destructive">
          <AlertTitle>No vehicle models available</AlertTitle>
          <AlertDescription>
            Add rows to the Model table so you can attach inventory. The admin
            model list returns every configured model slug.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="bg-card overflow-hidden rounded-2xl border shadow-sm ring-1 ring-border/60">
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
          totalItems={totalItems}
          onEdit={openEdit}
          onDeleteRequest={setDeleteCarCandidate}
          deleteMutation={deleteMutation}
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
        onDraftChange={(p) => setCreateDraft((prev) => ({ ...prev, ...p }))}
        models={models}
        onCreateModel={
          canCreateCars
            ? (name) => openAddModelDialog("create", name)
            : undefined
        }
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
        onCreateModel={
          canCreateCars ? (name) => openAddModelDialog("edit", name) : undefined
        }
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

      <CarDeleteDialog
        car={deleteCarCandidate}
        onOpenChange={(open) => {
          if (!open) {
            deleteMutation.reset();
            setDeleteCarCandidate(null);
          }
        }}
        mutation={deleteMutation}
      />

      <AddCarModelDialog
        open={Boolean(addModelTarget)}
        modelName={addModelName}
        onModelNameChange={(value) => {
          setAddModelName(value);
          setAddModelError(null);
        }}
        onOpenChange={handleAddModelOpenChange}
        onSubmit={() => {
          setAddModelError(null);
          createModelMutation.mutate(addModelName);
        }}
        error={addModelError}
        mutation={createModelMutation}
      />
    </div>
  );
}

export default function AdminCarsPage() {
  return (
    <PermissionGuard permissionKey="carsRead">
      <AdminCarsPageContent />
    </PermissionGuard>
  );
}
