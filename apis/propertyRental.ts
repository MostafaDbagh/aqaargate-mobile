import { Axios } from '@/lib/api';

export type PropertyRentalType =
  | 'apartment'
  | 'villa'
  | 'house'
  | 'land'
  | 'commercial'
  | 'office'
  | 'shop'
  | 'other';

export type PropertyRentalPayload = {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyType: PropertyRentalType;
  propertySize: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  features: string;
  additionalDetails?: string;
};

export type PropertyRentalResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

export const propertyRentalAPI = {
  createPropertyRentalRequest: async (
    payload: PropertyRentalPayload
  ): Promise<PropertyRentalResponse> => {
    const { data } = await Axios.post('/property-rental', payload);
    return data as PropertyRentalResponse;
  },
};
