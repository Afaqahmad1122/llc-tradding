"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { CarModelSummary } from "@/lib/api/cars";

import {
  newCarKvRow,
  type CarFormDraft,
  type CarKvRow,
} from "../_lib/draft-utils";
import {
  FUEL_OPTIONS,
  STEERING_OPTIONS,
  TRANSMISSION_OPTIONS,
} from "../_lib/constants";
import { CarModelCombobox } from "./car-model-combobox";

type CarFormFieldsProps = {
  draft: CarFormDraft;
  onChange: (patch: Partial<CarFormDraft>) => void;
  idPrefix: string;
  models: CarModelSummary[];
  referenceReadOnly?: boolean;
};

export function CarFormFields({
  draft,
  onChange,
  idPrefix,
  models,
  referenceReadOnly,
}: CarFormFieldsProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ref`}>Reference #</Label>
        <Input
          id={`${idPrefix}-ref`}
          value={draft.referenceNo}
          placeholder="e.g. LC-2024-001"
          onBlur={() =>
            onChange({
              referenceNo: draft.referenceNo.trim().toUpperCase(),
            })
          }
          onChange={(e) => onChange({ referenceNo: e.target.value })}
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={64}
          spellCheck={false}
          disabled={referenceReadOnly}
          readOnly={referenceReadOnly}
          className={referenceReadOnly ? "bg-muted" : undefined}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-model`}>Model</Label>
        <CarModelCombobox
          id={`${idPrefix}-model`}
          models={models}
          value={draft.modelId}
          onChange={(modelId) => onChange({ modelId })}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Title (optional)</Label>
        <Input
          id={`${idPrefix}-title`}
          value={draft.title}
          placeholder="Short headline for the listing (optional)"
          onChange={(e) => onChange({ title: e.target.value })}
          maxLength={200}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-year`}>Year</Label>
        <Input
          id={`${idPrefix}-year`}
          inputMode="numeric"
          value={draft.year}
          placeholder="e.g. 2022"
          onChange={(e) => onChange({ year: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-usd`}>Price (USD)</Label>
        <Input
          id={`${idPrefix}-usd`}
          inputMode="decimal"
          value={draft.priceUsd}
          placeholder="e.g. 18500"
          onChange={(e) => onChange({ priceUsd: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-pkr`}>Price PKR (optional)</Label>
        <Input
          id={`${idPrefix}-pkr`}
          inputMode="decimal"
          value={draft.pricePkr}
          placeholder="e.g. 5200000"
          onChange={(e) => onChange({ pricePkr: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mile`}>Mileage</Label>
        <Input
          id={`${idPrefix}-mile`}
          inputMode="numeric"
          value={draft.mileage}
          placeholder="e.g. 45000"
          onChange={(e) => onChange({ mileage: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mu`}>Mileage unit</Label>
        <Input
          id={`${idPrefix}-mu`}
          value={draft.mileageUnit}
          onChange={(e) => onChange({ mileageUnit: e.target.value })}
          maxLength={8}
          placeholder="km or mi"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-fuel`}>Fuel</Label>
        <NativeSelect
          id={`${idPrefix}-fuel`}
          value={draft.fuel}
          onChange={(e) => onChange({ fuel: e.target.value })}
          className="bg-background border-border/70 shadow-none"
        >
          <NativeSelectOption value="">Select fuel type</NativeSelectOption>
          {FUEL_OPTIONS.map((f) => (
            <NativeSelectOption key={f} value={f}>
              {f}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-trans`}>Transmission</Label>
        <NativeSelect
          id={`${idPrefix}-trans`}
          value={draft.transmission}
          onChange={(e) => onChange({ transmission: e.target.value })}
          className="bg-background border-border/70 shadow-none"
        >
          <NativeSelectOption value="">Select transmission</NativeSelectOption>
          {TRANSMISSION_OPTIONS.map((f) => (
            <NativeSelectOption key={f} value={f}>
              {f}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-steer`}>Steering</Label>
        <NativeSelect
          id={`${idPrefix}-steer`}
          value={draft.steering}
          onChange={(e) => onChange({ steering: e.target.value })}
          className="bg-background border-border/70 shadow-none"
        >
          <NativeSelectOption value="">Select steering</NativeSelectOption>
          {STEERING_OPTIONS.map((f) => (
            <NativeSelectOption key={f} value={f}>
              {f}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-seats`}>Seats</Label>
        <Input
          id={`${idPrefix}-seats`}
          inputMode="numeric"
          value={draft.seats}
          placeholder="e.g. 5"
          onChange={(e) => onChange({ seats: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-doors`}>Doors</Label>
        <Input
          id={`${idPrefix}-doors`}
          inputMode="numeric"
          value={draft.doors}
          placeholder="e.g. 4"
          onChange={(e) => onChange({ doors: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ecc`}>Engine CC</Label>
        <Input
          id={`${idPrefix}-ecc`}
          inputMode="numeric"
          value={draft.engineCc}
          placeholder="e.g. 2000"
          onChange={(e) => onChange({ engineCc: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ecode`}>Engine code</Label>
        <Input
          id={`${idPrefix}-ecode`}
          value={draft.engineCode}
          placeholder="e.g. B48"
          onChange={(e) => onChange({ engineCode: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mcode`}>Model code</Label>
        <Input
          id={`${idPrefix}-mcode`}
          value={draft.modelCode}
          placeholder="Factory / option code"
          onChange={(e) => onChange({ modelCode: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-chassis`}>Chassis #</Label>
        <Input
          id={`${idPrefix}-chassis`}
          value={draft.chassisNo}
          placeholder="VIN or chassis number"
          onChange={(e) => onChange({ chassisNo: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-color`}>Color</Label>
        <Input
          id={`${idPrefix}-color`}
          value={draft.color}
          placeholder="e.g. Pearl White"
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-drive`}>Drive</Label>
        <Input
          id={`${idPrefix}-drive`}
          value={draft.drive}
          placeholder="e.g. AWD, FWD, RWD"
          onChange={(e) => onChange({ drive: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-country`}>Country</Label>
        <Input
          id={`${idPrefix}-country`}
          value={draft.country}
          placeholder="e.g. Japan"
          onChange={(e) => onChange({ country: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>City</Label>
        <Input
          id={`${idPrefix}-city`}
          value={draft.city}
          placeholder="e.g. Tokyo"
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </div>

      <div className="space-y-8 sm:col-span-2 rounded-xl border border-border/50 bg-muted/15 p-4 ring-1 ring-border/30 sm:p-5 dark:bg-muted/10">
        <CarKvRecordSection
          idPrefix={idPrefix}
          section="specs"
          title="Specifications (optional)"
          hint="Add simple details like trim, engine notes, or package info."
          addLabel="Add specification"
          keyPlaceholder="e.g. Trim package"
          valueTextPlaceholder="e.g. Sport grade"
          rows={draft.specsRows}
          onRowsChange={(specsRows) => onChange({ specsRows })}
        />
        <CarKvRecordSection
          idPrefix={idPrefix}
          section="features"
          title="Features (optional)"
          hint="Add equipment details such as sunroof, navigation, or safety options."
          addLabel="Add feature"
          keyPlaceholder="e.g. Sunroof"
          valueTextPlaceholder="e.g. Panoramic glass"
          rows={draft.featuresRows}
          onRowsChange={(featuresRows) => onChange({ featuresRows })}
        />

        <div className="border-border/40 flex items-center gap-2 border-t pt-6">
          <Checkbox
            id={`${idPrefix}-pub`}
            checked={draft.isPublished}
            onCheckedChange={(c) => onChange({ isPublished: c === true })}
          />
          <Label htmlFor={`${idPrefix}-pub`} className="font-normal">
            Published on public inventory
          </Label>
        </div>
      </div>
    </div>
  );
}

function CarKvRecordSection({
  idPrefix,
  section,
  title,
  hint,
  addLabel,
  keyPlaceholder = "e.g. Package name",
  valueTextPlaceholder = "Enter value",
  rows,
  onRowsChange,
}: {
  idPrefix: string;
  section: string;
  title: string;
  hint: string;
  addLabel: string;
  keyPlaceholder?: string;
  valueTextPlaceholder?: string;
  rows: CarKvRow[];
  onRowsChange: (next: CarKvRow[]) => void;
}) {
  const updateRow = (id: string, patch: Partial<CarKvRow>) => {
    onRowsChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    onRowsChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-base font-semibold">{title}</Label>
        <p className="text-muted-foreground text-sm leading-relaxed">{hint}</p>
      </div>
      <div className="space-y-2">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/70 bg-muted/10 px-4 py-8 text-center dark:bg-muted/5">
            <p className="text-muted-foreground text-sm">None added yet.</p>
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.id}
              className="flex flex-col gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:gap-3"
            >
              <div className="space-y-1.5">
                <Label
                  className="text-muted-foreground text-xs"
                  htmlFor={`${idPrefix}-${section}-key-${row.id}`}
                >
                  Name
                </Label>
                <Input
                  id={`${idPrefix}-${section}-key-${row.id}`}
                  value={row.key}
                  onChange={(e) => updateRow(row.id, { key: e.target.value })}
                  placeholder={keyPlaceholder}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div className="space-y-1.5 sm:min-w-0">
                <Label
                  className="text-muted-foreground text-xs"
                  htmlFor={`${idPrefix}-${section}-val-${row.id}`}
                >
                  Value
                </Label>
                {row.kind === "yesNo" ? (
                  <div className="flex h-9 items-center gap-2 px-1">
                    <Checkbox
                      id={`${idPrefix}-${section}-val-${row.id}`}
                      checked={row.yesNo}
                      onCheckedChange={(c) =>
                        updateRow(row.id, { yesNo: c === true })
                      }
                    />
                    <Label
                      htmlFor={`${idPrefix}-${section}-val-${row.id}`}
                      className="cursor-pointer font-normal text-sm"
                    >
                      Yes
                    </Label>
                  </div>
                ) : row.kind === "json" ? (
                  <Textarea
                    id={`${idPrefix}-${section}-val-${row.id}`}
                    value={row.text}
                    onChange={(e) =>
                      updateRow(row.id, { text: e.target.value })
                    }
                    rows={2}
                    className="resize-y font-mono text-xs min-h-[60px]"
                    spellCheck={false}
                    placeholder='{"nested": true}'
                    aria-label={`Value row ${index + 1}`}
                  />
                ) : (
                  <Input
                    id={`${idPrefix}-${section}-val-${row.id}`}
                    value={row.text}
                    onChange={(e) =>
                      updateRow(row.id, { text: e.target.value })
                    }
                    inputMode={row.kind === "number" ? "decimal" : "text"}
                    placeholder={
                      row.kind === "number"
                        ? "e.g. 2.5"
                        : valueTextPlaceholder
                    }
                    autoComplete="off"
                  />
                )}
              </div>
              <div className="flex shrink-0 justify-end pb-0.5 sm:justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove row"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 border-border/70 shadow-none active:translate-y-0"
        onClick={() => onRowsChange([...rows, newCarKvRow()])}
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  );
}
