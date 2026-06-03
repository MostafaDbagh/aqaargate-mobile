/**
 * Centralized rent-type constants and normalization. Used across components for
 * consistency. Ported from web `constants/rentTypes.js`.
 * Keep in sync with aqaarGateBE2/models/listing.model.js (rentType enum).
 */

/** Normalize rent-type variations to the standard backend format. */
export const rentTypeNormalizationMap: Record<string, string> = {
  'one year': 'one-year',
  'one-year': 'one-year',
  one_year: 'one-year',
  '1 year': 'one-year',
  '1-year': 'one-year',
  yearly: 'yearly',
  year: 'yearly',
  monthly: 'monthly',
  month: 'monthly',
  weekly: 'weekly',
  week: 'weekly',
  daily: 'daily',
  day: 'daily',
  // Quarterly / semi-annual variants — the BE listing enum accepts these.
  'three month': 'three-month',
  'three-month': 'three-month',
  three_month: 'three-month',
  '3 month': 'three-month',
  '3-month': 'three-month',
  quarterly: 'three-month',
  'six month': 'six-month',
  'six-month': 'six-month',
  six_month: 'six-month',
  '6 month': 'six-month',
  '6-month': 'six-month',
  'semi-annual': 'six-month',
  semiannual: 'six-month',
};

/** Valid rent-type values that match the backend Listing enum. */
export const validRentTypes = [
  'daily',
  'weekly',
  'monthly',
  'three-month',
  'six-month',
  'one-year',
  'yearly',
] as const;

export type RentType = (typeof validRentTypes)[number];

/** Normalize a rent-type value to the standard backend format. */
export const normalizeRentType = (rentType?: string | null): string => {
  if (!rentType) return 'monthly';
  const lower = rentType.toLowerCase().trim();
  return rentTypeNormalizationMap[lower] || lower;
};
