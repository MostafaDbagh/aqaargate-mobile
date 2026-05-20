import { Axios } from '@/lib/api';

export type City = {
  city: string;
  displayName: string;
  count: number;
  imageSrc?: string | null;
  cityOriginal?: string;
};

type CitiesResponse = {
  success: boolean;
  data: { cities: City[]; total?: number };
};

// City images are served from the web frontend's public/ directory, not the
// backend. Production base is www.aqaargate.com.
const WEB_IMAGE_BASE = 'https://www.aqaargate.com';

export function resolveCityImageUrl(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  return `${WEB_IMAGE_BASE}${src.startsWith('/') ? '' : '/'}${src}`;
}

export const cityAPI = {
  getCityStats: async (): Promise<City[]> => {
    const { data } = await Axios.get<CitiesResponse>('/cities');
    return data?.data?.cities ?? [];
  },
};
