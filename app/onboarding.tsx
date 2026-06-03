import * as Haptics from 'expo-haptics';
import { useRouter, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingDots } from '@/components/onboarding/onboarding-dots';
import {
  OnboardingSlide,
  type OnboardingSlideData,
  type SlideIconKind,
} from '@/components/onboarding/onboarding-slide';
import { markOnboardingSeen } from '@/lib/onboarding';

const ICONS: SlideIconKind[] = ['sparkles', 'shield', 'chat'];

type RawSlide = Pick<OnboardingSlideData, 'title' | 'desc' | 'chipPrimary' | 'chipSecondary'>;

const TABS_HREF = '/(tabs)' as Href;
const LOGIN_HREF = '/(auth)/login' as Href;

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const [pageH, setPageH] = useState(0);

  const raw = t('onboarding.slides', { returnObjects: true }) as RawSlide[] | string;
  const slides: OnboardingSlideData[] = (Array.isArray(raw) ? raw : []).map((s, i) => ({
    key: `slide-${i}`,
    icon: ICONS[i] ?? 'sparkles',
    ...s,
  }));

  const isLast = index >= slides.length - 1;

  const buzz = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, slides.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setIndex(clamped);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = width > 0 ? Math.round(e.nativeEvent.contentOffset.x / width) : 0;
    if (next !== index) setIndex(next);
  };

  const onWrapLayout = (e: LayoutChangeEvent) => setPageH(e.nativeEvent.layout.height);

  const finish = async (goLogin = false) => {
    buzz();
    await markOnboardingSeen();
    router.replace(TABS_HREF);
    if (goLogin) router.push(LOGIN_HREF);
  };

  const onPrimaryPress = () => {
    if (isLast) {
      finish(false);
      return;
    }
    buzz();
    goTo(index + 1);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-cream">
      {/* Skip — trailing top corner, hidden on the last slide */}
      <View
        className="px-5 h-11 justify-center"
        style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
        {!isLast ? (
          <Pressable
            onPress={() => finish(false)}
            hitSlop={10}
            accessibilityRole="button"
            className="px-2 py-1 active:opacity-60">
            <Text className="text-note text-[15px] font-semibold">{t('onboarding.skip')}</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Paged carousel */}
      <View className="flex-1" onLayout={onWrapLayout}>
        {pageH > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumEnd}
            scrollEventThrottle={16}>
            {slides.map((slide) => (
              <View key={slide.key} style={{ width, height: pageH }}>
                <OnboardingSlide data={slide} isRTL={isRTL} />
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Footer: dots + CTA(s) */}
      <View className="px-7 pt-2 pb-3">
        <View className="mb-6">
          <OnboardingDots count={slides.length} index={index} />
        </View>

        <Pressable
          onPress={onPrimaryPress}
          accessibilityRole="button"
          className="w-full bg-primary rounded-2xl py-4 items-center justify-center active:opacity-80"
          style={{
            shadowColor: '#f1913d',
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          }}>
          <Text className="text-white text-[16px] font-bold">
            {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </Pressable>

        {isLast ? (
          <Pressable
            onPress={() => finish(true)}
            accessibilityRole="button"
            className="w-full bg-white border border-line rounded-2xl py-4 items-center justify-center mt-3 active:bg-cream">
            <Text className="text-secondary text-[15px] font-semibold">
              {t('onboarding.haveAccount')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
