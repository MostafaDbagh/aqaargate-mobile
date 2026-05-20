import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useAuth, useSendOtp, useVerifyOtp } from '@/apis/hooks';
import type { OtpType } from '@/apis/auth';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { OtpInput } from '@/components/forms/otp-input';
import { PrimaryButton } from '@/components/forms/primary-button';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { otpSchema, type OtpInputData } from '@/lib/schemas';

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{
    type: OtpType;
    email: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>();
  const type = (params.type ?? 'signup') as OtpType;
  const email = params.email ?? '';

  const verifyOtp = useVerifyOtp();
  const sendOtp = useSendOtp();
  const { signup } = useAuth();

  const { control, handleSubmit, setValue } = useForm<OtpInputData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const isForgot = type === 'forgot_password';

  const submitVerified = async (otp: string) => {
    try {
      await verifyOtp.mutateAsync({ email, otp, type });
      if (isForgot) {
        router.replace({ pathname: '/(auth)/new-password', params: { email } });
        return;
      }
      // Signup: now actually create the account
      await signup.mutateAsync({
        username: params.username ?? '',
        email,
        password: params.password ?? '',
        confirmPassword: params.confirmPassword ?? '',
        agreeToTerms: true,
        role: 'user',
      });
      router.dismissAll();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('otpVerification.verificationFailed')));
    }
  };

  const onSubmit = handleSubmit((values) => submitVerified(values.otp));

  const onResend = async () => {
    try {
      await sendOtp.mutateAsync({ email, type });
      toast.success(t('otpVerification.resentToast'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  };

  const title = isForgot
    ? t('otpVerification.titleForgotPassword')
    : t('otpVerification.title');
  const submitLabel = isForgot
    ? t('otpVerification.verifyAndReset')
    : t('otpVerification.verifyAndComplete');
  const busy = verifyOtp.isPending || signup.isPending;

  return (
    <AuthScreenShell title={title} subtitle={t('otpVerification.sentCode', { email })}>
      <Text className="text-gray-700 mb-3">{t('otpVerification.enterCode')}</Text>
      <OtpInput
        control={control}
        name="otp"
        autoSubmit={(code) => {
          setValue('otp', code);
          submitVerified(code);
        }}
      />

      <PrimaryButton
        label={busy ? t('otpVerification.verifying') : submitLabel}
        loading={busy}
        onPress={onSubmit}
      />

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500">{t('otpVerification.didntReceive')}</Text>
        <Pressable onPress={onResend} disabled={sendOtp.isPending}>
          <Text className="text-brand-accent font-semibold">
            {sendOtp.isPending ? t('otpVerification.resending') : t('otpVerification.resendCode')}
          </Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
