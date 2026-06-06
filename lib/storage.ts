import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  // Stores the app version the onboarding carousel was last completed for, so it
  // re-shows on a fresh install AND once after every app-version update. (Existing
  // installs on the old boolean key naturally fall through to "not seen".)
  onboardingSeenVersion: 'onboarding_seen_version',
  // Persisted "compare properties" selection (max 3 listings).
  compare: 'compare_v1',
} as const;

export const storage = {
  async getString(key: string) {
    return AsyncStorage.getItem(key);
  },
  async setString(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  async setJSON(key: string, value: unknown) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
  async multiRemove(keys: string[]) {
    await AsyncStorage.multiRemove(keys);
  },
};
