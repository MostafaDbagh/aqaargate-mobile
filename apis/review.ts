import { Axios } from '@/lib/api';

/** A populated reviewer reference (when the review was left by a logged-in user). */
export type ReviewUser = { _id?: string; username?: string; avatar?: string };

export type Review = {
  _id: string;
  propertyId?: string;
  agentId?: string | null;
  userId?: string | ReviewUser | null;
  name: string;
  email?: string | null;
  review: string;
  rating: number;
  likes?: number;
  dislikes?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateReviewPayload = {
  propertyId: string;
  name: string;
  phone: string;
  email?: string;
  review: string;
  rating?: number;
  userId?: string;
};

export const reviewAPI = {
  /** GET /review/property/{propertyId} → newest-first list for a listing. */
  getByProperty: async (propertyId: string): Promise<Review[]> => {
    const { data } = await Axios.get(`/review/property/${propertyId}`);
    return (data?.data ?? []) as Review[];
  },

  /** POST /review → creates a review and returns the created object. */
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await Axios.post('/review', payload);
    return data?.review as Review;
  },
};
