import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SettingsIcon } from '@/components/settings-icon';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

export function HomeHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const onPress = () => {
    if (process.env.EXPO_OS === 'ios') Haptics.selectionAsync();
    if (isAuthed) router.push('/(auth)/profile');
    else router.push('/(auth)/login');
  };

  const initial = (user?.username?.[0] ?? 'U').toUpperCase();

  return (
    <View className="overflow-hidden">
      {/* Warm-tinted gradient gives the bar depth instead of a flat slab.
          Top color matches the brand dark so it blends into the safe-area inset. */}
      <LinearGradient
        colors={['#2c2e33', '#2e2d31', '#352c29']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="flex-row items-center justify-between px-5 pt-3 pb-3.5">
        <Animated.View
          entering={FadeInDown.springify().damping(16).delay(60)}
          className="flex-row items-center gap-2.5">
          {/* Brand mark — the web logo (Logo-32x32.png), gently breathing.
              CSS-style reanimated animation, same idiom as hello-wave.tsx. */}
          <Animated.View
            style={{
              animationName: { '50%': { transform: [{ scale: 1.06 }] } },
              animationIterationCount: 'infinite',
              animationDuration: '3000ms',
              animationTimingFunction: 'ease-in-out',
            }}>
            <Image
              source={require('../assets/images/logo-mark.png')}
              style={{ width: 34, height: 34 }}
              contentFit="contain"
            />
          </Animated.View>

          <View>
            <View className="flex-row items-baseline">
              <Text className="text-white text-[19px] font-extrabold tracking-tight">Aqaar</Text>
              <Text className="text-primary text-[19px] font-extrabold tracking-tight">Gate</Text>
            </View>
            <Text className="text-white/55 text-[10.5px] font-medium tracking-wide mt-0.5">
              {t('header.tagline')}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.springify().damping(16).delay(140)}
          className="flex-row items-center gap-2">
          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={isAuthed ? t('header.account') : t('header.login')}
            className="flex-row items-center gap-2 bg-white/10 rounded-full pl-1 pr-3.5 py-1.5 border border-white/15 active:bg-white/20">
            {isAuthed ? (
              <>
                <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white font-extrabold text-[11px]">{initial}</Text>
                </View>
                <Text className="text-white text-[12px] font-semibold" numberOfLines={1}>
                  {user?.username ?? t('header.account')}
                </Text>
              </>
            ) : (
              <>
                <View className="w-7 h-7 rounded-full bg-primary/30 items-center justify-center">
                  <Ionicons name="person" size={14} color="#fff" />
                </View>
                <Text className="text-white text-[12px] font-semibold">{t('header.login')}</Text>
              </>
            )}
          </Pressable>
          <SettingsIcon variant="dark" />
        </Animated.View>
      </View>
    </View>
  );
}
