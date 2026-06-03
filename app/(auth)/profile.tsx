import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';

import { useAuth, useChangePassword, useUpdateProfile } from '@/apis/hooks';
import { AuthScreenShell } from '@/components/forms/auth-screen-shell';
import { PasswordField } from '@/components/forms/password-field';
import { PhoneInput } from '@/components/forms/phone-input';
import { PrimaryButton } from '@/components/forms/primary-button';
import { TextField } from '@/components/forms/text-field';
import { useToast } from '@/components/feedback/toast';
import { getApiErrorMessage } from '@/lib/api';
import { openLegal } from '@/lib/legal';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/schemas';
import { selectCurrentUser } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

type ProfileFormValues = {
  username: string;
  email: string;
  phone: string;
  description: string;
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector(selectCurrentUser);
  const { signout } = useAuth();
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <AuthScreenShell title={t('profile.title')}>
      <ProfileForm userId={user._id} initial={user} />

      <View className="h-px bg-gray-200 my-6" />

      <Pressable
        onPress={() => setShowPasswordSection((s) => !s)}
        className="flex-row items-center justify-between mb-3">
        <Text className="text-brand text-lg font-bold">{t('profile.changePassword')}</Text>
        <Text className="text-brand-accent font-semibold">{showPasswordSection ? '−' : '+'}</Text>
      </Pressable>
      {showPasswordSection ? <ChangePasswordForm userId={user._id} /> : null}

      <View className="h-px bg-gray-200 my-6" />

      <Pressable
        onPress={() => openLegal('privacy', i18n.language)}
        className="flex-row items-center py-3 active:opacity-70">
        <Ionicons name="shield-checkmark-outline" size={20} color="#f1913d" />
        <Text className="flex-1 mx-3 text-brand text-base font-semibold">
          {t('legal.privacyPolicy')}
        </Text>
        <Ionicons name="open-outline" size={16} color="#a8abae" />
      </Pressable>
      <Pressable
        onPress={() => openLegal('terms', i18n.language)}
        className="flex-row items-center py-3 active:opacity-70">
        <Ionicons name="document-text-outline" size={20} color="#f1913d" />
        <Text className="flex-1 mx-3 text-brand text-base font-semibold">
          {t('legal.termsOfService')}
        </Text>
        <Ionicons name="open-outline" size={16} color="#a8abae" />
      </Pressable>

      <View className="h-px bg-gray-200 my-6" />

      <PrimaryButton
        label={signout.isPending ? '...' : t('profile.logout')}
        variant="secondary"
        loading={signout.isPending}
        onPress={() => {
          Alert.alert(t('profile.logoutConfirmTitle'), t('profile.logoutConfirmMessage'), [
            { text: t('profile.cancel'), style: 'cancel' },
            {
              text: t('profile.confirm'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await signout.mutateAsync();
                } catch {
                  // ignore — clearCredentials still runs in onSettled
                } finally {
                  toast.success(t('profile.logout'));
                  router.dismissAll();
                }
              },
            },
          ]);
        }}
      />
    </AuthScreenShell>
  );
}

function ProfileForm({
  userId,
  initial,
}: {
  userId: string;
  initial: { username: string; email: string; phone?: string; description?: string };
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const updateProfile = useUpdateProfile(userId);

  const { control, handleSubmit } = useForm<ProfileFormValues>({
    defaultValues: {
      username: initial.username,
      email: initial.email,
      phone: initial.phone ?? '',
      description: initial.description ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values);
      toast.success(t('profile.savedToast'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  });

  return (
    <>
      <TextField control={control} name="username" label={t('profile.username')} />
      <TextField
        control={control}
        name="email"
        label={t('profile.email')}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <PhoneInput
            label={t('profile.phone')}
            value={(value as string) ?? ''}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
      />
      <TextField
        control={control}
        name="description"
        label={t('profile.description')}
        multiline
        numberOfLines={3}
      />
      <PrimaryButton
        label={updateProfile.isPending ? t('profile.saving') : t('profile.save')}
        loading={updateProfile.isPending}
        onPress={onSubmit}
      />
    </>
  );
}

function ChangePasswordForm({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const toast = useToast();
  const changePassword = useChangePassword(userId);

  const { control, handleSubmit, reset } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync(values.newPassword);
      toast.success(t('profile.passwordChanged'));
      reset();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('errors.generic')));
    }
  });

  return (
    <>
      <PasswordField control={control} name="oldPassword" label={t('profile.oldPassword')} />
      <PasswordField control={control} name="newPassword" label={t('profile.newPassword')} />
      <PasswordField
        control={control}
        name="confirmPassword"
        label={t('profile.confirmPassword')}
      />
      <PrimaryButton
        label={changePassword.isPending ? t('profile.updating') : t('profile.updatePassword')}
        loading={changePassword.isPending}
        onPress={onSubmit}
      />
    </>
  );
}
