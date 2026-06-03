import { storage, STORAGE_KEYS } from './storage';

/**
 * First-run "getting started" flow gate.
 *
 * Persisted in AsyncStorage so the carousel auto-shows exactly once per install.
 * Reads default to "seen" on any storage error — a flaky read should never trap
 * a returning user back in onboarding.
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    return (await storage.getString(STORAGE_KEYS.onboardingSeen)) === '1';
  } catch {
    return true;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    await storage.setString(STORAGE_KEYS.onboardingSeen, '1');
  } catch {
    // Non-fatal: worst case the carousel shows again next launch.
  }
}
