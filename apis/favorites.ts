import { Axios, type Listing } from '@/lib/api';

/**
 * Favorites (wishlist) API — ported from web apis/favorites.js.
 * The mobile Axios instance attaches the Bearer token automatically, so these
 * only work for authenticated users (the backend rejects guests with 401).
 */
export const favoriteAPI = {
  add: async (propertyId: string) => {
    const { data } = await Axios.post('/favorites', { propertyId });
    return data;
  },
  remove: async (propertyId: string) => {
    const { data } = await Axios.delete(`/favorites/${propertyId}`);
    return data;
  },
  list: async (): Promise<Listing[]> => {
    const { data } = await Axios.get('/favorites');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.favorites)) return data.favorites;
    return [];
  },
};

/** Pull the listing id out of whatever shape the favorites endpoint returns. */
export function extractFavoriteId(item: unknown): string | null {
  if (!item) return null;
  if (typeof item === 'string') return item;
  const o = item as Record<string, any>;
  return o._id || o.propertyId || o.property?._id || o.listing?._id || null;
}
