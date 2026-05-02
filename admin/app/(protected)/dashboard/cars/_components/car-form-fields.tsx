"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { CarModelSummary } from "@/lib/api/cars";

import type { CarFormDraft } from "../_lib/draft-utils";
import {
  FUEL_OPTIONS,
  STEERING_OPTIONS,
  TRANSMISSION_OPTIONS,
} from "../_lib/constants";

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
    <div className="grid max-h-[min(65vh,calc(100vh-14rem))] gap-4 overflow-y-auto sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ref`}>Reference #</Label>
        <Input
          id={`${idPrefix}-ref`}
          value={draft.referenceNo}
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
        <NativeSelect
          id={`${idPrefix}-model`}
          value={draft.modelId}
          onChange={(e) => onChange({ modelId: e.target.value })}
        >
          <NativeSelectOption value="">Select a model…</NativeSelectOption>
          {models.map((m) => (
            <NativeSelectOption key={m.id} value={m.id}>
              {m.brand} — {m.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Title (optional)</Label>
        <Input
          id={`${idPrefix}-title`}
          value={draft.title}
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
          onChange={(e) => onChange({ year: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-usd`}>Price (USD)</Label>
        <Input
          id={`${idPrefix}-usd`}
          inputMode="decimal"
          value={draft.priceUsd}
          onChange={(e) => onChange({ priceUsd: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-pkr`}>Price PKR (optional)</Label>
        <Input
          id={`${idPrefix}-pkr`}
          inputMode="decimal"
          value={draft.pricePkr}
          onChange={(e) => onChange({ pricePkr: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mile`}>Mileage</Label>
        <Input
          id={`${idPrefix}-mile`}
          inputMode="numeric"
          value={draft.mileage}
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
          placeholder="km"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-fuel`}>Fuel</Label>
        <NativeSelect
          id={`${idPrefix}-fuel`}
          value={draft.fuel}
          onChange={(e) => onChange({ fuel: e.target.value })}
        >
          <NativeSelectOption value="">—</NativeSelectOption>
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
        >
          <NativeSelectOption value="">—</NativeSelectOption>
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
        >
          <NativeSelectOption value="">—</NativeSelectOption>
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
          onChange={(e) => onChange({ seats: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-doors`}>Doors</Label>
        <Input
          id={`${idPrefix}-doors`}
          inputMode="numeric"
          value={draft.doors}
          onChange={(e) => onChange({ doors: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ecc`}>Engine CC</Label>
        <Input
          id={`${idPrefix}-ecc`}
          inputMode="numeric"
          value={draft.engineCc}
          onChange={(e) => onChange({ engineCc: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-ecode`}>Engine code</Label>
        <Input
          id={`${idPrefix}-ecode`}
          value={draft.engineCode}
          onChange={(e) => onChange({ engineCode: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-mcode`}>Model code</Label>
        <Input
          id={`${idPrefix}-mcode`}
          value={draft.modelCode}
          onChange={(e) => onChange({ modelCode: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-chassis`}>Chassis #</Label>
        <Input
          id={`${idPrefix}-chassis`}
          value={draft.chassisNo}
          onChange={(e) => onChange({ chassisNo: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-color`}>Color</Label>
        <Input
          id={`${idPrefix}-color`}
          value={draft.color}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-drive`}>Drive</Label>
        <Input
          id={`${idPrefix}-drive`}
          value={draft.drive}
          onChange={(e) => onChange({ drive: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-country`}>Country</Label>
        <Input
          id={`${idPrefix}-country`}
          value={draft.country}
          onChange={(e) => onChange({ country: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>City</Label>
        <Input
          id={`${idPrefix}-city`}
          value={draft.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-specs`}>
          Specifications JSON (optional)
        </Label>
        <Textarea
          id={`${idPrefix}-specs`}
          value={draft.specsJson}
          onChange={(e) => onChange({ specsJson: e.target.value })}
          rows={4}
          className="resize-y font-mono text-xs"
          spellCheck={false}
          placeholder={`{\n  "trim": "G"\n}`}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-feat`}>Features JSON (optional)</Label>
        <Textarea
          id={`${idPrefix}-feat`}
          value={draft.featuresJson}
          onChange={(e) => onChange({ featuresJson: e.target.value })}
          rows={4}
          className="resize-y font-mono text-xs"
          spellCheck={false}
          placeholder={`{\n  "sunroof": true\n}`}
        />
      </div>

      <div className="flex items-center gap-2 sm:col-span-2">
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
  );
}
