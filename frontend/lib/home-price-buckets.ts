/**
 * Builds ~6 evenly spaced USD price range labels from API meta min/max.
 */
export function buildPriceBuckets(priceRange:
  | { min: string | null; max: string | null }
  | undefined): string[] {
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
    return [`${formatter.format(min)} - ${formatter.format(max)}`];
  }

  const bucketCount = 6;
  const step = (max - min) / bucketCount;
  const out: string[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const lo = min + step * i;
    const hi = i === bucketCount - 1 ? max : min + step * (i + 1);
    out.push(`${formatter.format(lo)} - ${formatter.format(hi)}`);
  }

  return out;
}
