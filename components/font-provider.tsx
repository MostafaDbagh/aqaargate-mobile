import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, type TextStyle } from 'react-native';

import { fontMap, pickFont } from '@/lib/fonts';

SplashScreen.preventAutoHideAsync().catch(() => {});

type TextAny = typeof Text & {
  render?: (props: unknown, ref: unknown) => any;
  __aqaarPatched?: boolean;
  __aqaarOriginalRender?: (props: unknown, ref: unknown) => any;
};
type InputAny = typeof TextInput & {
  render?: (props: unknown, ref: unknown) => any;
  __aqaarPatched?: boolean;
  __aqaarOriginalRender?: (props: unknown, ref: unknown) => any;
};

/**
 * Monkey-patches React Native `<Text>` and `<TextInput>` so every text node
 * picks the right Lexend / Tajawal weight automatically without touching
 * existing call-sites. Re-runs when the locale changes.
 */
function applyFontPatch(isAr: boolean) {
  const TextRef = Text as unknown as TextAny;
  const InputRef = TextInput as unknown as InputAny;

  if (!TextRef.__aqaarOriginalRender && typeof TextRef.render === 'function') {
    TextRef.__aqaarOriginalRender = TextRef.render;
  }
  if (!InputRef.__aqaarOriginalRender && typeof InputRef.render === 'function') {
    InputRef.__aqaarOriginalRender = InputRef.render;
  }

  const wrap = (
    original: ((props: unknown, ref: unknown) => any) | undefined,
    target: { render?: typeof original }
  ) => {
    if (!original) return;
    target.render = function patched(props: any, ref: any) {
      const out = original.call(this, props, ref);
      if (!out || !out.props) return out;
      const flat = StyleSheet.flatten(out.props.style) as TextStyle | undefined;
      const ff = pickFont(flat?.fontWeight, isAr);
      // Inject as the LOWEST-priority style so callers can still override.
      return {
        ...out,
        props: {
          ...out.props,
          style: [{ fontFamily: ff }, out.props.style],
        },
      };
    };
  };

  wrap(TextRef.__aqaarOriginalRender, TextRef as any);
  wrap(InputRef.__aqaarOriginalRender, InputRef as any);
  TextRef.__aqaarPatched = true;
  InputRef.__aqaarPatched = true;
}

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [loaded, error] = useFonts(fontMap);
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const lastLocale = useRef<string | null>(null);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  // Re-patch whenever the locale changes so the right family is selected
  // (Lexend ↔ Tajawal).
  useEffect(() => {
    if (!loaded) return;
    if (lastLocale.current === i18n.language) return;
    lastLocale.current = i18n.language;
    applyFontPatch(isAr);
  }, [loaded, i18n.language, isAr]);

  if (!loaded && !error) return null;
  return <>{children}</>;
}
