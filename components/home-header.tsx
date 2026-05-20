import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

export function HomeHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const onPress = () => {
    if (isAuthed) router.push('/(auth)/profile');
    else router.push('/(auth)/login');
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-1 bg-brand">
      <Text className="text-white text-xl font-extrabold">AqaarGate</Text>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={isAuthed ? t('header.account') : t('header.login')}
        className="flex-row items-center gap-2 bg-white/10 rounded-full pl-3 pr-3 py-1.5 active:bg-white/20">
        {isAuthed ? (
          <>
            <View className="w-7 h-7 rounded-full bg-brand-accent items-center justify-center">
              <Text className="text-white font-bold text-xs">
                {(user?.username?.[0] ?? 'U').toUpperCase()}
              </Text>
            </View>
            <Text className="text-white text-sm font-semibold" numberOfLines={1}>
              {user?.username ?? t('header.account')}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="person-circle-outline" size={20} color="#fff" />
            <Text className="text-white text-sm font-semibold">{t('header.login')}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
