import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

type Props = {
  /** Light = on white backgrounds. Dark = on dark/branded backgrounds. */
  variant?: 'light' | 'dark';
};

/**
 * Compact circular avatar button shown in the top-right of tab screens.
 * Tap → profile (signed in) or login (signed out).
 */
export function AccountIcon({ variant = 'light' }: Props) {
  const router = useRouter();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const onPress = () => {
    if (isAuthed) router.push('/(auth)/profile');
    else router.push('/(auth)/login');
  };

  const isDark = variant === 'dark';
  const bg = isDark ? 'rgba(255, 255, 255, 0.10)' : '#fef7f1';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.18)' : '#ececec';
  const iconColor = isDark ? '#ffffff' : '#2c2e33';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isAuthed ? 'Account' : 'Sign in'}
      hitSlop={8}
      className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
      style={{ backgroundColor: bg, borderWidth: 1, borderColor }}>
      {isAuthed && user?.username ? (
        <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
          <Text className="text-white font-extrabold text-[14px]">
            {user.username[0].toUpperCase()}
          </Text>
        </View>
      ) : (
        <Ionicons name="person-outline" size={20} color={iconColor} />
      )}
    </Pressable>
  );
}
