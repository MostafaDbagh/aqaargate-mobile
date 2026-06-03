/**
 * Property-type metadata for the buy/rent landing flows (e.g. holiday homes).
 *
 * Each key is the URL/route slug (kebab-case singular, matching the type's
 * English name). `apiName` is the canonical backend `propertyType` value.
 * `statuses` lists which buy/rent intents are valid (Holiday Home is rent-only).
 * Ported from web `lib/propertyTypeConfig.js`.
 */

export type PropertyTypeConfigEntry = {
  apiName: string;
  enPlural: string;
  arPlural: string;
  statuses: ('sale' | 'rent')[];
};

export const PROPERTY_TYPE_CONFIG: Record<string, PropertyTypeConfigEntry> = {
  apartment: { apiName: 'Apartment', enPlural: 'Apartments', arPlural: 'شقق', statuses: ['sale', 'rent'] },
  villa: { apiName: 'Villa', enPlural: 'Villas', arPlural: 'فلل', statuses: ['sale', 'rent'] },
  building: { apiName: 'Building', enPlural: 'Buildings', arPlural: 'بنايات', statuses: ['sale', 'rent'] },
  office: { apiName: 'Office', enPlural: 'Offices', arPlural: 'مكاتب', statuses: ['sale', 'rent'] },
  commercial: {
    apiName: 'Commercial',
    enPlural: 'Commercial Properties',
    arPlural: 'عقارات تجارية',
    statuses: ['sale', 'rent'],
  },
  land: { apiName: 'Land', enPlural: 'Land', arPlural: 'أراضي', statuses: ['sale', 'rent'] },
  chalet: { apiName: 'Chalet', enPlural: 'Chalets', arPlural: 'شاليهات', statuses: ['sale', 'rent'] },
  'holiday-home': { apiName: 'Holiday Home', enPlural: 'Holiday Homes', arPlural: 'بيوت عطلات', statuses: ['rent'] },
};

export const PROPERTY_TYPE_SLUGS = Object.keys(PROPERTY_TYPE_CONFIG);

/** Slug → config (or null for unknown slug). */
export function getPropertyTypeBySlug(slug?: string | null): PropertyTypeConfigEntry | null {
  return PROPERTY_TYPE_CONFIG[String(slug || '').toLowerCase()] || null;
}

/** Canonical apiName (e.g. "Holiday Home") → slug ("holiday-home"), or null. */
export function slugForPropertyType(apiName?: string | null): string | null {
  if (!apiName) return null;
  const found = Object.entries(PROPERTY_TYPE_CONFIG).find(
    ([, v]) => v.apiName.toLowerCase() === String(apiName).toLowerCase()
  );
  return found ? found[0] : null;
}

/** Slugs that support a given status. */
export function typeParamsForStatus(status: 'sale' | 'rent'): string[] {
  return PROPERTY_TYPE_SLUGS.filter((slug) => PROPERTY_TYPE_CONFIG[slug].statuses.includes(status));
}

/** Localized plural label for a property-type slug. */
export function localizePropertyTypePlural(slug: string, locale: string = 'en'): string {
  const cfg = getPropertyTypeBySlug(slug);
  if (!cfg) return slug;
  return locale === 'ar' ? cfg.arPlural : cfg.enPlural;
}
