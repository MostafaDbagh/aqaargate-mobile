import { Axios } from '@/lib/api';

/** Mirrors the web "Contact Agent" inquiry — POST /message/. */
export type MessagePayload = {
  propertyId: string;
  agentId: string;
  senderName: string;
  senderEmail?: string;
  senderPhone: string;
  subject: string;
  message: string;
  messageType: string;
};

export type MessageResponse = {
  success?: boolean;
  data?: unknown;
  message?: string;
  error?: string;
};

export const messageAPI = {
  send: async (payload: MessagePayload): Promise<MessageResponse> => {
    const { data } = await Axios.post('/message/', payload);
    return data as MessageResponse;
  },
};
