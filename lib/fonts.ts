/**
 * Font configuration — Lexend (Latin) for English, Tajawal (Arabic) for ar locale.
 * Matches the web app's $font-main / $font-tajawal SCSS variables.
 *
 * Maps React Native `fontWeight` styles to the correct loaded Google Font.
 * Use `pickFont(weight, isAr)` in custom Text overrides or per-component styles.
 */

import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
} from '@expo-google-fonts/lexend';
import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal';

export const fontMap = {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
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

/** Pick the right loaded font name based on weight + locale. */
export function pickFont(weight: WeightLike, isAr: boolean): string {
  const w = normalizeWeight(weight);
  if (isAr) {
    // Tajawal has 3 weights — bucket aggressively.
    if (w >= 700) return 'Tajawal_700Bold';
    if (w >= 500) return 'Tajawal_500Medium';
    return 'Tajawal_400Regular';
  }
  // Lexend has 5 weights loaded.
  if (w >= 800) return 'Lexend_800ExtraBold';
  if (w >= 700) return 'Lexend_700Bold';
  if (w >= 600) return 'Lexend_600SemiBold';
  if (w >= 500) return 'Lexend_500Medium';
  return 'Lexend_400Regular';
}
