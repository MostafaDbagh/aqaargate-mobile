/**
 * Single source of truth for all city metadata used across the app.
 *
 * Owns: URL slug, canonical English name, canonical Arabic name, and known
 * spelling variants (aliases) on both sides. Every other city lookup derives
 * from CITIES below — do not hand-maintain parallel maps in components.
 *
 * Ported from web `aqaarGate-FE/constants/cities.js` to keep the two products
 * in sync.
 */

export type City = {
  slug: string | null;
  en: string;
  ar: string;
  enAliases: string[];
  arAliases: string[];
};

export const CITIES: City[] = [
  {
    slug: 'damascus',
    en: 'Damascus',
    ar: 'دمشق',
    enAliases: [],
    arAliases: ['الشام', 'دمشق الشام', 'دِمَشق', 'دمشقي'],
  },
  {
    slug: 'rif-dimashq',
    en: 'Rif Dimashq',
    ar: 'ريف دمشق',
    enAliases: ['Rif-Dimashq', 'RifDimashq', 'Damascus Countryside'],
    arAliases: [],
  },
  {
    slug: 'aleppo',
    en: 'Aleppo',
    ar: 'حلب',
    enAliases: ['Halab', 'Aleppe'],
    arAliases: ['حلب الشهباء', 'الشهباء'],
  },
  {
    slug: 'homs',
    en: 'Homs',
    ar: 'حمص',
    enAliases: ['Hims'],
    arAliases: ['حمس'],
  },
  {
    slug: 'hama',
    en: 'Hama',
    ar: 'حماة',
    enAliases: ['Hamah'],
    arAliases: ['حماه'],
  },
  {
    slug: 'latakia',
    en: 'Latakia',
    ar: 'اللاذقية',
    enAliases: ['Lattakia', 'Lataqia', 'Al-Ladhiqiyah'],
    arAliases: ['لاذقية', 'لاذكية', 'لاذيقية', 'الاذقية', 'اللاذقيه'],
  },
  {
    slug: 'tartous',
    en: 'Tartous',
    ar: 'طرطوس',
    enAliases: ['Tartus', 'Tartoos'],
    arAliases: ['طرطوز'],
  },
  {
    slug: 'idlib',
    en: 'Idlib',
    ar: 'إدلب',
    enAliases: [],
    arAliases: ['ادلب'],
  },
  {
    slug: 'daraa',
    en: 'Daraa',
    ar: 'درعا',
    enAliases: ['Dara', 'Daraah'],
    arAliases: ['درعة', 'دراعا'],
  },
  {
    slug: 'as-suwayda',
    en: 'As-Suwayda',
    ar: 'السويداء',
    enAliases: ['Suwayda', 'Sweida', 'Sueda', 'Al-Suwayda'],
    arAliases: ['السويدا', 'سويداء', 'سويدا'],
  },
  // Below — present in the data but not yet wired to dedicated landing pages.
  // Translations still need to work for listings filed under these cities.
  {
    slug: null,
    en: 'Deir ez-Zur',
    ar: 'دير الزور',
    enAliases: ['Deir ez-Zor', 'Der El Zor'],
    arAliases: ['ديرالزور'],
  },
  {
    slug: null,
    en: 'Raqqah',
    ar: 'الرقة',
    enAliases: ['Al-Raqqah', 'Ar-Raqqah'],
    arAliases: [],
  },
];

// ---- Derived lookups (do not edit by hand — recompute from CITIES) ----

/** URL slugs of cities that have dedicated landing pages, in display order. */
export const CITY_SLUGS: string[] = CITIES.filter((c) => c.slug).map((c) => c.slug as string);

/** English (incl. alias) → canonical Arabic. */
export const EN_TO_AR_CITY: Record<string, string> = Object.fromEntries(
  CITIES.flatMap((c) => [[c.en, c.ar], ...c.enAliases.map((a) => [a, c.ar] as const)])
);

/** Arabic (incl. alias) → canonical English. */
export const AR_TO_EN_CITY: Record<string, string> = Object.fromEntries(
  CITIES.flatMap((c) => [[c.ar, c.en], ...c.arAliases.map((a) => [a, c.en] as const)])
);

/** English (incl. alias) → URL slug (null for cities without a landing page). */
export const EN_TO_SLUG: Record<string, string | null> = Object.fromEntries(
  CITIES.flatMap((c) => [[c.en, c.slug], ...c.enAliases.map((a) => [a, c.slug] as const)])
);

/** Slug → canonical English. */
export const SLUG_TO_EN: Record<string, string> = Object.fromEntries(
  CITIES.filter((c) => c.slug).map((c) => [c.slug as string, c.en])
);

/** Slug → canonical Arabic. */
export const SLUG_TO_AR: Record<string, string> = Object.fromEntries(
  CITIES.filter((c) => c.slug).map((c) => [c.slug as string, c.ar])
);

// ---- Helpers ----

/** Translate an English city name to Arabic, falling back to the input. */
export function getArabicCity(enName?: string | null): string | null | undefined {
  if (!enName) return enName;
  return EN_TO_AR_CITY[enName] || enName;
}

/** Translate an Arabic city name to English (API value), falling back to the input. */
export function getEnglishCity(arName?: string | null): string | null | undefined {
  if (!arName) return arName;
  return AR_TO_EN_CITY[arName] || arName;
}

/**
 * Resolve a city name (English, English alias, or Arabic) to its URL slug.
 * Returns null when the city has no dedicated landing page.
 */
export function getCitySlug(cityName?: string | null): string | null {
  if (!cityName) return null;
  if (cityName in EN_TO_SLUG) return EN_TO_SLUG[cityName];
  const en = AR_TO_EN_CITY[cityName];
  return en ? EN_TO_SLUG[en] ?? null : null;
}

/** Localize a city name for display. AR → Arabic; else English canonical. */
export function localizeCity(cityName?: string | null, locale: string = 'en'): string | null | undefined {
  if (!cityName) return cityName;
  if (locale === 'ar') return getArabicCity(cityName);
  return AR_TO_EN_CITY[cityName] || cityName;
}
