import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useSendOtp } from '@/apis/hooks';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { CheckboxField } from '@/components/forms/checkbox-field';
import { PasswordField } from '@/components/forms/password-field';
import { PrimaryButton } from '@/components/forms/primary-button';
import { TextField } from '@/components/forms/text-field';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { registerSchema, type RegisterInput } from '@/lib/schemas';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const sendOtp = useSendOtp();

  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false as unknown as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendOtp.mutateAsync({ email: values.email, type: 'signup' });
      router.push({
        pathname: '/(auth)/otp',
        params: {
          type: 'signup',
          email: values.email,
          username: values.username,
          password: values.password,
          confirmPassword: values.confirmPassword,
        },
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  });

  return (
    <AuthScreenShell title={t('register.title')} subtitle={t('register.subtitle')}>
      <TextField
        control={control}
        name="username"
        label={t('register.username')}
        placeholder={t('register.usernamePlaceholder')}
        autoCapitalize="none"
      />
      <TextField
        control={control}
        name="email"
        label={t('register.email')}
        placeholder={t('register.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <PasswordField
        control={control}
        name="password"
        label={t('register.password')}
        placeholder={t('register.passwordPlaceholder')}
      />
      <PasswordField
        control={control}
        name="confirmPassword"
        label={t('register.confirmPassword')}
        placeholder={t('register.confirmPasswordPlaceholder')}
      />
      <CheckboxField control={control} name="agreeToTerms" label={t('register.agreeToTerms')} />

      <PrimaryButton
        label={sendOtp.isPending ? t('register.creatingAccount') : t('register.createAccount')}
        loading={sendOtp.isPending}
        onPress={onSubmit}
      />

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500">{t('register.alreadyHaveAccount')}</Text>
        <Link href="/(auth)/login" replace asChild>
          <Pressable>
            <Text className="text-brand-accent font-semibold">{t('register.login')}</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
