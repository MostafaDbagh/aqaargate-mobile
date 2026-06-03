/**
 * Currency codes & display symbols. Aligned with the listing model & API
 * (`USD`, `SYP`, `TRY`, `EUR`). Ported from web `constants/currencies.js`.
 *
 * Note: unlike the web (which concatenates `symbol + amount` into one string
 * and so keeps a trailing space), the mobile cards render the symbol in its own
 * <Text> node, so symbols here are stored WITHOUT a trailing space.
 */

/** Listing / search currency codes. */
export const LISTING_CURRENCY_CODES = ['USD', 'SYP', 'EUR', 'TRY'] as const;

export type CurrencyCode = (typeof LISTING_CURRENCY_CODES)[number];

/** Dropdown labels (filters & forms). */
export const LISTING_CURRENCY_LABELS: Record<string, string> = {
  USD: 'USD ($)',
  SYP: 'SYP',
  EUR: 'EUR (€)',
  TRY: 'TRY (₺)',
};

/**
 * Display symbols. The first four mirror the web's canonical set; GBP/AED/SAR
 * are retained from the previous mobile card map so older listings still render.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  SYP: 'SYP',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  AED: 'د.إ',
  SAR: 'ر.س',
};

/** Default currency used when a listing or filter omits one. */
export const DEFAULT_CURRENCY = 'USD';

/** Resolve a code (case-insensitive) to its display symbol; fallback to the code or "$". */
export const getCurrencySymbol = (code?: string | null): string => {
  const normalized = String(code || DEFAULT_CURRENCY)
    .trim()
    .toUpperCase();
  return CURRENCY_SYMBOLS[normalized] || (normalized ? normalized : '$');
};
