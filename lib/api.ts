import axios, { AxiosError } from 'axios';

import { STORAGE_KEYS, storage } from './storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://aqaargatebe2.onrender.com/api';

export const Axios = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

Axios.interceptors.request.use(async (config) => {
  const token = await storage.getString(STORAGE_KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Axios.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? '';
      const isSignin = url.includes('/auth/signin');
      if (!isSignin) onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    return data?.message ?? data?.error ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export type ListingImage = { url: string; publicId?: string };

export type Listing = {
  _id: string;
  propertyId?: string;
  propertyType?: string;
  propertyKeyword?: string;
  propertyDesc?: string;
  description_ar?: string;
  propertyPrice?: number;
  currency?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit?: string;
  city?: string;
  state?: string;
  address?: string;
  address_ar?: string;
  images?: ListingImage[];
  isFeatured?: boolean;
};

export type SearchParams = {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  status?: string;
  propertyType?: string;
  city?: string;
  state?: string;
  cities?: string;
  bedrooms?: string;
  bathrooms?: string;
  furnished?: string;
  priceMin?: string;
  priceMax?: string;
  currency?: string;
  sizeMin?: string;
  sizeMax?: string;
  sizeUnit?: string;
  amenities?: string[];
  isVip?: string;
};

export type ListingPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ListingSearchResult = {
  data: Listing[];
  pagination: ListingPagination;
};

export async function searchListings(params: SearchParams = {}): Promise<Listing[]> {
  const { data } = await Axios.get('/listing/search', { params });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export async function searchListingsPaginated(
  params: SearchParams = {}
): Promise<ListingSearchResult> {
  const { data } = await Axios.get('/listing/search', { params });
  const listings: Listing[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  const limit = Number(params.limit ?? 12);
  const page = Number(params.page ?? 1);
  const total = Number(data?.pagination?.total ?? listings.length);
  const totalPages = Number(
    data?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit))
  );
  return {
    data: listings,
    pagination: {
      page: Number(data?.pagination?.page ?? page),
      limit: Number(data?.pagination?.limit ?? limit),
      total,
      totalPages,
      hasNextPage:
        data?.pagination?.hasNextPage ?? page < totalPages,
      hasPrevPage: data?.pagination?.hasPrevPage ?? page > 1,
    },
  };
}
