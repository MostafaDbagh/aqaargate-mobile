import type { Listing } from '@/lib/api';
import { STORAGE_KEYS, storage } from '@/lib/storage';

import { setCompareItems } from './slices/compare-slice';
import { store } from './store';

/** Load the persisted compare selection into the store (call once on boot). */
export async function hydrateCompare() {
  const items = await storage.getJSON<Listing[]>(STORAGE_KEYS.compare);
  if (Array.isArray(items) && items.length > 0) {
    store.dispatch(setCompareItems(items));
  }
}

/**
 * Mirror the compare selection to AsyncStorage on every change. RTK/Immer hands
 * us a fresh `items` reference per mutation, so a cheap identity check is enough.
 */
export function setupComparePersistence() {
  let last = store.getState().compare.items;
  store.subscribe(() => {
    const items = store.getState().compare.items;
    if (items !== last) {
      last = items;
      storage.setJSON(STORAGE_KEYS.compare, items).catch(() => {});
    }
  });
}
