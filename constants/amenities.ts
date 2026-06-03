/**
 * Single source of truth for amenities. Ported from web `constants/amenities.js`.
 *
 * `amenitiesList` — canonical English values stored on listings.
 * `amenityToTranslationKey` — maps each value to the `amenities.*` i18n key.
 * `AR_AMENITY` — direct English→Arabic translation (server-safe / no i18n hook).
 * `EN_AMENITY` — identity map for symmetry.
 *
 * Translations also live in i18n/messages/{en,ar}.json under `amenities` —
 * keep those aligned with AR_AMENITY here.
 */

export const amenitiesList = [
  'Solar energy system',
  'Star link internet',
  'Fiber internet',
  'Basic internet',
  'Parking',
  'Lift',
  'A/C',
  'Gym',
  'Security cameras',
  'Reception (nator)',
  'Balcony',
  'Swimming pool',
  'Fire alarms',
] as const;

export type Amenity = (typeof amenitiesList)[number];

/** Amenity display value → i18n translation key (under `amenities.*`). */
export const amenityToTranslationKey: Record<string, string> = {
  'Solar energy system': 'solarEnergySystem',
  'Star link internet': 'starLinkInternet',
  'Fiber internet': 'fiberInternet',
  'Basic internet': 'basicInternet',
  Parking: 'parking',
  Lift: 'lift',
  'A/C': 'ac',
  Gym: 'gym',
  'Security cameras': 'securityCameras',
  'Reception (nator)': 'receptionNator',
  Balcony: 'balcony',
  'Swimming pool': 'swimmingPool',
  'Fire alarms': 'fireAlarms',
};

/** Server-safe Arabic translations. Mirrors messages/ar.json `amenities.*`. */
export const AR_AMENITY: Record<string, string> = {
  'Solar energy system': 'نظام الطاقة الشمسية',
  'Star link internet': 'إنترنت ستارلينك',
  'Fiber internet': 'إنترنت فايبر',
  'Basic internet': 'إنترنت عادي',
  Parking: 'موقف سيارات',
  Lift: 'مصعد',
  'A/C': 'تكييف',
  Gym: 'صالة رياضية',
  'Security cameras': 'كاميرات أمنية',
  'Reception (nator)': 'استقبال (ناطور)',
  Balcony: 'شرفة (بلكونة)',
  'Swimming pool': 'مسبح',
  'Fire alarms': 'إنذار حريق',
};

/** Identity map — used for symmetric localizeAmenity calls. */
export const EN_AMENITY: Record<string, string> = Object.fromEntries(
  amenitiesList.map((a) => [a, a])
);

/** Translate one amenity to Arabic; falls back to the input unchanged. */
export const getArabicAmenity = (enName?: string | null): string | null | undefined => {
  if (!enName) return enName;
  return AR_AMENITY[enName] || enName;
};

/** Localize an amenity for display. AR → Arabic; else passthrough. */
export const localizeAmenity = (enName?: string | null, locale: string = 'en'): string | null | undefined => {
  if (locale === 'ar') return getArabicAmenity(enName);
  return enName;
};
