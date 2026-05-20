import { Axios } from '@/lib/api';

import type { User } from './auth';

export type UpdateProfilePayload = Partial<{
  username: string;
  email: string;
  phone: string;
  description: string;
  avatar: { uri: string; name: string; type: string };
}>;

type UserResponse = { user: User; success?: boolean; message?: string };
type GenericResponse = { success?: boolean; message?: string };

export const userAPI = {
  getProfile: async (userId: string): Promise<User> => {
    const { data } = await Axios.get(`/user/${userId}`);
    return (data?.user ?? data) as User;
  },

  updateProfile: async (userId: string, payload: UpdateProfilePayload): Promise<UserResponse> => {
    const hasFile = !!payload.avatar?.uri;
    if (hasFile) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value == null) return;
        if (key === 'avatar' && payload.avatar) {
          form.append('avatar', payload.avatar as unknown as Blob);
        } else {
          form.append(key, String(value));
        }
      });
      const { data } = await Axios.post(`/user/update/${userId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await Axios.post(`/user/update/${userId}`, payload);
    return data;
  },

  changePassword: async (userId: string, newPassword: string): Promise<UserResponse> => {
    const { data } = await Axios.post(`/user/update/${userId}`, { password: newPassword });
    return data;
  },

  deleteAccount: async (userId: string): Promise<GenericResponse> => {
    const { data } = await Axios.delete(`/user/delete/${userId}`);
    return data;
  },
};
