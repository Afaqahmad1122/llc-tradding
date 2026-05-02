/**
 * Price buckets for home sidebar: labels + numeric bounds for /cars query params.
 */
export type PriceBucket = {
  label: string;
  priceMin: number;
  priceMax: number;
};

const BUCKET_COUNT = 6;

/**
 * Builds ~6 evenly spaced USD price buckets from API meta min/max.
 */
export function buildPriceBuckets(priceRange:
  | { min: string | null; max: string | null }
  | undefined): PriceBucket[] {
  if (!priceRange?.min || !priceRange?.max) return [];

  const min = Number(priceRange.min);
  const max = Number(priceRange.max);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (max < min) return [];

  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (max === min) {
    return [
      {
        label: formatter.format(min),
        priceMin: Math.floor(min),
        priceMax: Math.ceil(max),
      },
    ];
  }

  const step = (max - min) / BUCKET_COUNT;
  const out: PriceBucket[] = [];

  for (let i = 0; i < BUCKET_COUNT; i++) {
    const lo = min + step * i;
    const hi = i === BUCKET_COUNT - 1 ? max : min + step * (i + 1);
    const priceMin = Math.floor(lo);
    const priceMax = Math.ceil(hi);
    const label =
      formatter.format(priceMin) === formatter.format(priceMax)
        ? formatter.format(priceMin)
        : `${formatter.format(priceMin)} - ${formatter.format(priceMax)}`;
    out.push({ label, priceMin, priceMax });
  }

  return out;
}
