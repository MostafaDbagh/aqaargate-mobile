import { Axios } from '@/lib/api';
import type { Listing } from '@/lib/api';

export type ExtendedListing = Listing & {
  neighborhood?: string;
  neighborhood_ar?: string;
  country?: string;
  landArea?: number;
  furnished?: boolean;
  garages?: boolean;
  garageSize?: number;
  yearBuilt?: number | null;
  amenities?: string[];
  videoUrl?: string;
  mapLocation?: string;
  agent?: string;
  agentId?: string | { _id?: string; firstName?: string; lastName?: string; phone?: string; email?: string; avatar?: string; isTrueAgent?: boolean };
  agentName?: string;
  agentName_ar?: string;
  agentEmail?: string;
  agentNumber?: string;
  agentWhatsapp?: string;
  isVip?: boolean;
  isSold?: boolean;
  notes?: string;
  notes_ar?: string;
  propertyId?: string;
  rentType?: 'monthly' | 'weekly' | 'daily' | 'yearly' | 'one-year';
  floor?: number;
};

export const listingAPI = {
  getById: async (id: string): Promise<ExtendedListing> => {
    const { data } = await Axios.get(`/listing/${id}`);
    // Backend returns either { success, data: {...} } or the listing directly
    return (data?.data ?? data) as ExtendedListing;
  },

  getByAgent: async (
    agentId: string,
    params: { limit?: number; sort?: string } = {}
  ): Promise<ExtendedListing[]> => {
    const { data } = await Axios.get(`/listing/agent/${agentId}`, { params });
    if (Array.isArray(data)) return data as ExtendedListing[];
    if (Array.isArray(data?.data)) return data.data as ExtendedListing[];
    if (Array.isArray(data?.listings)) return data.listings as ExtendedListing[];
    return [];
  },
};
