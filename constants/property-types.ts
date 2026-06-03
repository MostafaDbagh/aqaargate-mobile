/**
 * Single source of truth for property type values.
 *
 * PROPERTY_TYPES — canonical English values matching the listing `propertyType`
 * stored in the backend (proper case, singular form).
 *
 * PROPERTY_TYPE_AR — direct English→Arabic translation. Includes legacy /
 * synonym keys (Villa/farms, House, Studio, Farm, Duplex, …) and Syrian
 * vernacular types that may appear in older listings or AI parser output even
 * though they aren't in the canonical PROPERTY_TYPES list.
 * Ported/expanded from web `constants/propertyTypes.js`.
 */

export const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Building',
  'Office',
  'Commercial',
  'Land',
  'Holiday Home',
  'Chalet',
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_TYPE_AR: Record<string, string> = {
  Apartment: 'شقة',
  Villa: 'فيلا',
  Building: 'بناية',
  Office: 'مكتب',
  Commercial: 'محل تجاري',
  Land: 'أرض',
  'Holiday Home': 'بيت عطلات',
  Chalet: 'شاليه',
  // Legacy / synonym values still present in some BE data or AI parser output.
  'Villa/farms': 'فيلا',
  House: 'منزل',
  Studio: 'استوديو',
  Farm: 'مزرعة',
  Duplex: 'دوبلكس',
  Penthouse: 'بنتهاوس',
  Warehouse: 'مستودع',
  'Shell House': 'منزل على الهيكل',
  // Syrian / Levantine vernacular property types.
  'Arab House': 'بيت عربي',
  'Damascene House': 'بيت دمشقي',
  'Countryside House': 'بيت ريفي',
  'Rural House': 'بيت ريفي',
  Shop: 'محل تجاري',
  Store: 'محل تجاري',
};

/**
 * Curated English display labels where the raw API value isn't user-friendly.
 * Mirrors web `common.listingPropertyTypes` (e.g. Commercial → "Commercial Shop").
 */
export const EN_PROPERTY_TYPE_LABEL: Record<string, string> = {
  Commercial: 'Commercial Shop',
  'Villa/farms': 'Villa / Farm',
  'Shell House': 'Shell House',
};

/** Translate an English property type to Arabic; falls back to the input. */
export const getArabicPropertyType = (enType?: string | null): string | null | undefined => {
  if (!enType) return enType;
  return PROPERTY_TYPE_AR[enType] || enType;
};

/** Localize a property type for the given locale. AR → Arabic; EN → curated label. */
export const localizePropertyType = (enType?: string | null, locale: string = 'en'): string | null | undefined => {
  if (!enType) return enType;
  if (locale === 'ar') return getArabicPropertyType(enType);
  return EN_PROPERTY_TYPE_LABEL[enType] || enType;
};
