import { Axios } from '@/lib/api';

export type ContactPayload = {
  name: string;
  email?: string;
  phone: string;
  interest: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  message?: string;
  error?: string;
  retryAfter?: number;
};

export const contactAPI = {
  createContact: async (payload: ContactPayload): Promise<ContactResponse> => {
    const { data } = await Axios.post('/contacts/contact', payload);
    return data as ContactResponse;
  },
};
