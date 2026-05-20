import { Axios } from '@/lib/api';

export type FutureBuyerStatus = 'both' | 'sale' | 'rent';
export type FutureBuyerCurrency = 'USD' | 'SYP' | 'EUR' | 'TRY';
export type FutureBuyerSizeUnit = 'sqm' | 'dunam' | 'sqft' | 'sqyd' | 'feddan';

export type FutureBuyerPayload = {
  name: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  status: FutureBuyerStatus;
  minPrice?: number;
  maxPrice?: number;
  currency?: FutureBuyerCurrency;
  minSize?: number;
  maxSize?: number;
  sizeUnit?: FutureBuyerSizeUnit;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  notes?: string;
  /** Honeypot — bots fill this. Leave empty for real users. */
  website?: string;
};

export type FutureBuyerResponse = {
  success: boolean;
  message?: string;
  matchedPropertiesCount?: number;
  error?: string;
  retryAfter?: number;
};

export const futureBuyerAPI = {
  createFutureBuyer: async (payload: FutureBuyerPayload): Promise<FutureBuyerResponse> => {
    const { data } = await Axios.post('/future-buyers', payload);
    return data as FutureBuyerResponse;
  },
};
