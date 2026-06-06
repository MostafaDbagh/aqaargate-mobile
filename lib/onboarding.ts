import Constants from 'expo-constants';

import { storage, STORAGE_KEYS } from './storage';

/**
 * The app version this build reports (from app.json `expo.version`, e.g.
 * "1.0.0"). Onboarding is keyed on this string so bumping the release version
 * re-shows the carousel for everyone — see `hasSeenOnboarding`. Falls back to a
 * constant when the config is unavailable, degrading the gate to once-per-install.
 */
export function currentAppVersion(): string {
  return Constants.expoConfig?.version ?? 'unknown';
}

/**
 * First-run "getting started" flow gate.
 *
 * We persist the app version the carousel was last completed for (not a bare
 * boolean) so it auto-shows exactly once on a fresh install AND once again after
 * every app-version update. Reads default to "seen" on any storage error — a
 * flaky read should never trap a returning user back in onboarding.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const seenVersion = await storage.getString(STORAGE_KEYS.onboardingSeenVersion);
    return seenVersion === currentAppVersion();
  } catch {
    return true;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await storage.setString(STORAGE_KEYS.onboardingSeenVersion, currentAppVersion());
  } catch {
    // Non-fatal: worst case the carousel shows again next launch.
  }
}
