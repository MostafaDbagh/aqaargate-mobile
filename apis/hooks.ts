import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { clearCredentials, persistCredentials } from '@/store/persist';

import { authAPI, type OtpType, type SigninPayload, type SignupPayload } from './auth';
import { categoryAPI } from './category';
import { cityAPI } from './city';
import { userAPI, type UpdateProfilePayload } from './user';

export function useAuth() {
  const qc = useQueryClient();

  const signup = useMutation({
    mutationFn: (payload: SignupPayload) => authAPI.signup(payload),
    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await persistCredentials(data.user, data.token);
      }
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const signin = useMutation({
    mutationFn: (payload: SigninPayload) => authAPI.signin(payload),
    onSuccess: async (data) => {
      if (data?.token && data?.user) {
        await persistCredentials(data.user, data.token);
      }
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const signout = useMutation({
    mutationFn: () => authAPI.signout(),
    onSettled: async () => {
      await clearCredentials();
      qc.clear();
    },
  });

  return { signup, signin, signout };
}

export function useSendOtp() {
  return useMutation({
    mutationFn: ({ email, type }: { email: string; type: OtpType }) =>
      authAPI.sendOTP(email, type),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp, type }: { email: string; otp: string; type: OtpType }) =>
      authAPI.verifyOTP(email, otp, type),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, newPassword }: { email: string; newPassword: string }) =>
      authAPI.resetPassword(email, newPassword),
  });
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => userAPI.getProfile(userId as string),
    enabled: !!userId,
  });
}

export function useUpdateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userAPI.updateProfile(userId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user', 'profile', userId] }),
  });
}

export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (newPassword: string) => userAPI.changePassword(userId, newPassword),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategoryStats(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => cityAPI.getCityStats(),
    staleTime: 5 * 60 * 1000,
  });
}
