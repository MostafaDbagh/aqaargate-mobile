import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useSendOtp } from '@/apis/hooks';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { PrimaryButton } from '@/components/forms/primary-button';
import { TextField } from '@/components/forms/text-field';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const sendOtp = useSendOtp();

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendOtp.mutateAsync({ email: values.email, type: 'forgot_password' });
      router.push({
        pathname: '/(auth)/otp',
        params: { type: 'forgot_password', email: values.email },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  });

  return (
    <AuthScreenShell title={t('forgotPassword.title')} subtitle={t('forgotPassword.subtitle')}>
      <TextField
        control={control}
        name="email"
        label={t('forgotPassword.email')}
        placeholder={t('forgotPassword.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <PrimaryButton
        label={
          sendOtp.isPending ? t('forgotPassword.sending') : t('forgotPassword.sendResetCode')
        }
        loading={sendOtp.isPending}
        onPress={onSubmit}
      />

      <View className="items-center mt-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-brand-accent font-semibold">{t('forgotPassword.backToLogin')}</Text>
        </Pressable>
      </View>
    </AuthScreenShell>
  );
}
