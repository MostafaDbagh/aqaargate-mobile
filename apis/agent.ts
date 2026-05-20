import { Axios } from '@/lib/api';

export type Agent = {
  _id: string;
  id?: string;
  fullName?: string;
  username?: string;
  username_ar?: string;
  position?: string;
  position_ar?: string;
  job?: string;
  job_ar?: string;
  company?: string;
  company_ar?: string;
  companyName?: string;
  description?: string;
  description_ar?: string;
  location?: string;
  location_ar?: string;
  officeAddress?: string;
  officeAddress_ar?: string;
  officeNumber?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  avatar?: string;
  poster?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  isTrueAgent?: boolean;
  createdAt?: string;
};

type AgentsResponse = {
  success?: boolean;
  data?: Agent[];
} | Agent[];

export const agentAPI = {
  getAgents: async (): Promise<Agent[]> => {
    const { data } = await Axios.get<AgentsResponse>('/agents', {
      params: { _t: Date.now() },
      headers: {
        'Cache-Control': 'no-cache',
        'Accept-Language': 'en',
      },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as { data?: Agent[] })?.data)) {
      return (data as { data: Agent[] }).data;
    }
    return [];
  },

  getAgentById: async (id: string): Promise<Agent | null> => {
    const { data } = await Axios.get(`/agents/${id}`, {
      params: { _t: Date.now() },
      headers: { 'Cache-Control': 'no-cache' },
    });
    return (data?.data ?? data) as Agent | null;
  },
};
