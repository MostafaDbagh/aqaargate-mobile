/**
 * Single source of truth for size units (square meters, dunams, etc).
 * Mirrors the BE enum in aqaarGateBE2/models/listing.model.js → sizeUnit.
 * Ported from web `constants/sizeUnits.js`.
 */

export const SIZE_UNITS = ['sqm', 'dunam', 'sqft', 'sqyd', 'feddan'] as const;

export type SizeUnit = (typeof SIZE_UNITS)[number];

/** Default unit used when a listing doesn't specify one. */
export const DEFAULT_SIZE_UNIT: SizeUnit = 'sqm';

export const AR_SIZE_UNIT: Record<string, string> = {
  sqm: 'م²',
  dunam: 'دونم',
  sqft: 'قدم²',
  sqyd: 'ياردة²',
  feddan: 'فدان',
};

export const EN_SIZE_UNIT: Record<string, string> = {
  sqm: 'sqm',
  dunam: 'dunam',
  sqft: 'sqft',
  sqyd: 'sqyd',
  feddan: 'feddan',
};

/** i18n key under `amenities`/`common.*` — used by client components calling t(key). */
export const SIZE_UNIT_TRANSLATION_KEY: Record<string, string> = {
  sqm: 'sqm',
  dunam: 'dunam',
  sqft: 'sqft',
  sqyd: 'sqyd',
  feddan: 'feddan',
};

/** Resolve a size-unit value, lowercased and trimmed, falling back to default. */
export const normalizeSizeUnit = (unit?: string | null): SizeUnit => {
  const key = String(unit || DEFAULT_SIZE_UNIT).toLowerCase().trim();
  return (SIZE_UNITS as readonly string[]).includes(key) ? (key as SizeUnit) : DEFAULT_SIZE_UNIT;
};

/** Server-safe localized label for a size unit. Pass isAr=true for Arabic. */
export const getSizeUnitLabel = (unit?: string | null, isAr: boolean = false): string => {
  const key = normalizeSizeUnit(unit);
  return (isAr ? AR_SIZE_UNIT : EN_SIZE_UNIT)[key];
};

/** i18n key for the bare unit value (matches the message key). */
export const getSizeUnitTranslationKey = (unit?: string | null): string => {
  const key = normalizeSizeUnit(unit);
  return SIZE_UNIT_TRANSLATION_KEY[key];
};
