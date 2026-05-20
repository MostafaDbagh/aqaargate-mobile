import * as WebBrowser from 'expo-web-browser';

const SITE = 'https://www.aqaargate.com';

export type LegalKind = 'privacy' | 'terms';

export function legalUrl(kind: LegalKind, locale: string): string {
  const lang = locale === 'ar' ? 'ar' : 'en';
  const path = kind === 'privacy' ? 'privacy-policy' : 'terms-and-conditions';
  return `${SITE}/${lang}/${path}`;
}

export async function openLegal(kind: LegalKind, locale: string): Promise<void> {
  await WebBrowser.openBrowserAsync(legalUrl(kind, locale), {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: '#f1913d',
    toolbarColor: '#ffffff',
  });
}
