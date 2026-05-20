import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useResetPassword } from '@/apis/hooks';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { PasswordField } from '@/components/forms/password-field';
import { PrimaryButton } from '@/components/forms/primary-button';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { newPasswordSchema, type NewPasswordInput } from '@/lib/schemas';

export default function NewPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ email: string }>();
  const email = params.email ?? '';
  const resetPassword = useResetPassword();

  const { control, handleSubmit } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetPassword.mutateAsync({ email, newPassword: values.password });
      toast.success(t('newPassword.resetSuccess'));
      router.replace('/(auth)/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('newPassword.resetFailed')));
    }
  });

  return (
    <AuthScreenShell title={t('newPassword.title')} subtitle={t('newPassword.subtitle')}>
      <PasswordField
        control={control}
        name="password"
        label={t('newPassword.newPassword')}
        placeholder={t('newPassword.newPasswordPlaceholder')}
      />
      <PasswordField
        control={control}
        name="confirmPassword"
        label={t('newPassword.confirmPassword')}
        placeholder={t('newPassword.confirmPasswordPlaceholder')}
      />

      <PrimaryButton
        label={resetPassword.isPending ? t('newPassword.resetting') : t('newPassword.resetPassword')}
        loading={resetPassword.isPending}
        onPress={onSubmit}
      />
    </AuthScreenShell>
  );
}
