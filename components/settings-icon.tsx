import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

type Props = {
  /** Light = on white backgrounds. Dark = on dark/branded backgrounds. */
  variant?: 'light' | 'dark';
};

/** Gear button shown next to the account icon. Tap → /settings */
export function SettingsIcon({ variant = 'light' }: Props) {
  const router = useRouter();
  const { t } = useTranslation();

  const isDark = variant === 'dark';
  const bg = isDark ? 'rgba(255, 255, 255, 0.10)' : '#fef7f1';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : '#ececec';
  const iconColor = isDark ? '#ffffff' : '#2c2e33';

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel={t('settings.title')}
      hitSlop={8}
      className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
      style={{ backgroundColor: bg, borderWidth: 1, borderColor }}>
      <Ionicons name="settings-outline" size={20} color={iconColor} />
    </Pressable>
  );
}
