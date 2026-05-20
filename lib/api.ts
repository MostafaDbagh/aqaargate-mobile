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
  limit?: number;
  sort?: string;
  keyword?: string;
  status?: string;
  propertyType?: string;
};

export async function searchListings(params: SearchParams = {}): Promise<Listing[]> {
  const { data } = await Axios.get('/listing/search', { params });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
