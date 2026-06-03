/**
 * Single source of truth for listing status enums.
 *
 * LISTING_STATUS — the sale/rent split on a listing's `status`.
 * APPROVAL_STATUS — the moderation lifecycle on `approvalStatus`.
 *
 * Keep aligned with the backend listing schema
 * (aqaarGateBE2/models/listing.model.js → status, approvalStatus enums).
 * Ported from web `constants/listingStatus.js`.
 */

// ---- sale / rent ----

export const LISTING_STATUS = {
  SALE: 'sale',
  RENT: 'rent',
} as const;

export type ListingStatus = (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];

export const LISTING_STATUS_VALUES = Object.values(LISTING_STATUS);

export const AR_LISTING_STATUS: Record<string, string> = {
  [LISTING_STATUS.SALE]: 'للبيع',
  [LISTING_STATUS.RENT]: 'للإيجار',
};

export const EN_LISTING_STATUS: Record<string, string> = {
  [LISTING_STATUS.SALE]: 'Sale',
  [LISTING_STATUS.RENT]: 'Rent',
};

/** Localize a status code for display. AR → Arabic; else English label. */
export const localizeListingStatus = (status?: string | null, locale: string = 'en'): string | null | undefined => {
  if (!status) return status;
  const normalized = String(status).toLowerCase().trim();
  const map = locale === 'ar' ? AR_LISTING_STATUS : EN_LISTING_STATUS;
  return map[normalized] || status;
};

// ---- approval lifecycle ----

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
} as const;

export type ApprovalStatus = (typeof APPROVAL_STATUS)[keyof typeof APPROVAL_STATUS];

export const APPROVAL_STATUS_VALUES = Object.values(APPROVAL_STATUS);

export const AR_APPROVAL_STATUS: Record<string, string> = {
  [APPROVAL_STATUS.PENDING]: 'قيد المراجعة',
  [APPROVAL_STATUS.APPROVED]: 'موافق',
  [APPROVAL_STATUS.REJECTED]: 'مرفوض',
  [APPROVAL_STATUS.CLOSED]: 'مغلق',
};

export const EN_APPROVAL_STATUS: Record<string, string> = {
  [APPROVAL_STATUS.PENDING]: 'Pending',
  [APPROVAL_STATUS.APPROVED]: 'Approved',
  [APPROVAL_STATUS.REJECTED]: 'Rejected',
  [APPROVAL_STATUS.CLOSED]: 'Closed',
};

/** Localize an approval status for display. AR → Arabic; else English label. */
export const localizeApprovalStatus = (status?: string | null, locale: string = 'en'): string | null | undefined => {
  if (!status) return status;
  const normalized = String(status).toLowerCase().trim();
  const map = locale === 'ar' ? AR_APPROVAL_STATUS : EN_APPROVAL_STATUS;
  return map[normalized] || status;
};
