import { Axios } from '@/lib/api';

export type User = {
  _id: string;
  email: string;
  username: string;
  role: 'user' | 'agent' | 'admin';
  avatar?: string;
  phone?: string;
  description?: string;
};

export type OtpType = 'signup' | 'forgot_password';

export type SignupPayload = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'user' | 'agent';
  agreeToTerms: boolean;
};

export type SigninPayload = { email: string; password: string };

type AuthResponse = { token: string; user: User; success?: boolean; message?: string };
type GenericResponse = { success?: boolean; message?: string; data?: unknown };

export const authAPI = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const { data } = await Axios.post('/auth/signup', { role: 'user', ...payload });
    return data;
  },

  signin: async (payload: SigninPayload): Promise<AuthResponse> => {
    const { data } = await Axios.post('/auth/signin', payload);
    return data;
  },

  signout: async (): Promise<GenericResponse> => {
    const { data } = await Axios.get('/auth/signout');
    return data;
  },

  sendOTP: async (email: string, type: OtpType): Promise<GenericResponse> => {
    const { data } = await Axios.post('/auth/send-otp', { email, type });
    return data;
  },

  verifyOTP: async (email: string, otp: string, type: OtpType): Promise<GenericResponse> => {
    const { data } = await Axios.post('/auth/verify-otp', { email, otp, type });
    return data;
  },

  resetPassword: async (email: string, newPassword: string): Promise<GenericResponse> => {
    const { data } = await Axios.post('/auth/reset-password', { email, newPassword });
    return data;
  },
};
