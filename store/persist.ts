import type { User } from '@/apis/auth';
import { STORAGE_KEYS, storage } from '@/lib/storage';

import { logout, setCredentials } from './slices/auth-slice';
import { store } from './store';

export async function hydrateAuth() {
  const [token, user] = await Promise.all([
    storage.getString(STORAGE_KEYS.token),
    storage.getJSON<User>(STORAGE_KEYS.user),
  ]);
  if (token && user?._id) {
    store.dispatch(setCredentials({ user, token }));
  }
}

export async function persistCredentials(user: User, token: string) {
  await Promise.all([
    storage.setString(STORAGE_KEYS.token, token),
    storage.setJSON(STORAGE_KEYS.user, user),
  ]);
  store.dispatch(setCredentials({ user, token }));
}

export async function clearCredentials() {
  await storage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
  store.dispatch(logout());
}
