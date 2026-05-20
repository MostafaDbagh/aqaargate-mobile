import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/apis/hooks';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { PasswordField } from '@/components/forms/password-field';
import { PrimaryButton } from '@/components/forms/primary-button';
import { TextField } from '@/components/forms/text-field';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { loginSchema, type LoginInput } from '@/lib/schemas';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const { signin } = useAuth();

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signin.mutateAsync(values);
      toast.success(t('login.loginSuccess'));
      router.dismissAll();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('login.loginFailed')));
    }
  });

  return (
    <AuthScreenShell title={t('login.title')} subtitle={t('login.subtitle')}>
      <TextField
        control={control}
        name="email"
        label={t('login.email')}
        placeholder={t('login.emailPlaceholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <PasswordField
        control={control}
        name="password"
        label={t('login.password')}
        placeholder={t('login.passwordPlaceholder')}
      />

      <Link href="/(auth)/forgot-password" asChild>
        <Pressable className="self-end mb-4">
          <Text className="text-brand-accent text-sm font-semibold">
            {t('login.forgotPassword')}
          </Text>
        </Pressable>
      </Link>

      <PrimaryButton
        label={signin.isPending ? t('login.signingIn') : t('login.signIn')}
        loading={signin.isPending}
        onPress={onSubmit}
      />

      <View className="flex-row justify-center mt-6 gap-1">
        <Text className="text-gray-500">{t('login.dontHaveAccount')}</Text>
        <Link href="/(auth)/register" replace asChild>
          <Pressable>
            <Text className="text-brand-accent font-semibold">{t('login.register')}</Text>
          </Pressable>
        </Link>
      </View>
    </AuthScreenShell>
  );
}
