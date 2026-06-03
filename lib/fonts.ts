/**
 * Font configuration — a modern two-family system:
 *   • Cairo                → headings / emphasis (semibold and up)
 *   • IBM Plex Sans Arabic → body text (regular & medium)
 *
 * Both families ship Arabic AND Latin glyphs, so the correct script renders in
 * either language automatically — we only pick the FAMILY by weight. Bold text
 * (titles, prices, buttons) gets Cairo; body copy gets IBM Plex Sans Arabic.
 *
 * Use `pickFont(weight)` in custom Text overrides or per-component styles.
 */

import {
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
} from '@expo-google-fonts/ibm-plex-sans-arabic';

export const fontMap = {
  // Headings — Cairo
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  // Body — IBM Plex Sans Arabic
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
};

type WeightLike = string | number | undefined;

function normalizeWeight(w: WeightLike): number {
  if (w == null) return 400;
  if (typeof w === 'number') return w;
  const map: Record<string, number> = {
    normal: 400,
    bold: 700,
    '100': 100,
    '200': 200,
    '300': 300,
    '400': 400,
    '500': 500,
    '600': 600,
    '700': 700,
    '800': 800,
    '900': 900,
  };
  return map[String(w).toLowerCase()] ?? 400;
}

/**
 * Pick the right family + weight. Emphasis (>= 600) → Cairo heading family;
 * everything lighter → IBM Plex Sans Arabic body family. The second arg is
 * kept for call-site compatibility but unused — both fonts cover Arabic + Latin.
 */
export function pickFont(weight: WeightLike, _isAr?: boolean): string {
  const w = normalizeWeight(weight);
  if (w >= 800) return 'Cairo_800ExtraBold';
  if (w >= 700) return 'Cairo_700Bold';
  if (w >= 600) return 'Cairo_600SemiBold';
  if (w >= 500) return 'IBMPlexSansArabic_500Medium';
  return 'IBMPlexSansArabic_400Regular';
}
