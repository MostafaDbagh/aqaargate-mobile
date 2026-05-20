import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { SettingsIcon } from '@/components/settings-icon';
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
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
      <View className="flex-row items-baseline">
        <Text className="text-white text-[18px] font-extrabold tracking-tight">aqaar</Text>
        <Text className="text-primary text-[18px] font-extrabold tracking-tight">Gate</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={isAuthed ? t('header.account') : t('header.login')}
          className="flex-row items-center gap-2 bg-white/8 rounded-full pl-1 pr-3 py-1 border border-white/10 active:bg-white/15">
          {isAuthed ? (
            <>
              <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-extrabold text-[11px]">
                  {(user?.username?.[0] ?? 'U').toUpperCase()}
                </Text>
              </View>
              <Text className="text-white text-[12px] font-semibold" numberOfLines={1}>
                {user?.username ?? t('header.account')}
              </Text>
            </>
          ) : (
            <>
              <View className="w-7 h-7 rounded-full bg-white/15 items-center justify-center">
                <Ionicons name="person-outline" size={14} color="#fff" />
              </View>
              <Text className="text-white text-[12px] font-semibold">
                {t('header.login')}
              </Text>
            </>
          )}
        </Pressable>
        <SettingsIcon variant="dark" />
      </View>
    </View>
  );
}
