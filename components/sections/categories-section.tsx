import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  I18nManager,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { useCategories } from '@/apis/hooks';
import { CategoryIcon } from '@/components/icons/category-icons';

import { SectionHeader } from './section-header';

const ITEM_WIDTH = 130;
const ITEM_GAP = 10;
const STEP = ITEM_WIDTH + ITEM_GAP;
const AUTOPLAY_DELAY_MS = 2500;
const RESUME_AFTER_INTERACTION_MS = 5000;

const PROPERTY_TYPE_AR: Record<string, string> = {
  Apartment: 'شقة',
  'Villa/Farms': 'فيلا/مزرعة',
  Villa: 'فيلا',
  Building: 'بناء',
  Office: 'مكتب',
  Commercial: 'تجاري',
  Land: 'أرض',
  'Holiday Home': 'بيت عطلات',
  Chalet: 'شاليه',
};

type Props = {
  activeName?: string;
  onSelect: (name: string) => void;
};

export function CategoriesSection({ activeName, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: categories = [], isLoading, isError } = useCategories();

  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const viewportWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isLoading || categories.length <= 1) return;

    const tick = () => {
      if (pausedRef.current) return;
      const maxOffset = Math.max(0, contentWidthRef.current - viewportWidthRef.current);
      if (maxOffset <= 0) return;

      let next = offsetRef.current + STEP;
      if (next > maxOffset) next = 0;
      offsetRef.current = next;

      // In RTL, React Native's ScrollView flips coordinates on iOS but not Android.
      // I18nManager.isRTL reflects the layout direction we should account for.
      const targetX = I18nManager.isRTL ? -next : next;
      scrollRef.current?.scrollTo({ x: targetX, animated: true });
    };

    intervalRef.current = setInterval(tick, AUTOPLAY_DELAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [isLoading, categories.length]);

  const pauseAutoplay = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_INTERACTION_MS);
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    offsetRef.current = Math.abs(e.nativeEvent.contentOffset.x);
  };

  if (isError && categories.length === 0) return null;

  return (
    <View className="py-5 bg-white">
      <SectionHeader
        title={t('categoriesSection.title')}
        subtitle={t('categoriesSection.subtitle')}
      />

      {isLoading ? (
        <View className="h-[100px] items-center justify-center">
          <ActivityIndicator color="#f1913d" />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: ITEM_GAP }}
          onLayout={(e) => {
            viewportWidthRef.current = e.nativeEvent.layout.width;
          }}
          onContentSizeChange={(w) => {
            contentWidthRef.current = w;
          }}
          onScrollBeginDrag={pauseAutoplay}
          onMomentumScrollBegin={pauseAutoplay}
          onScroll={handleScroll}
          scrollEventThrottle={32}>
          {categories.map((c) => {
            const active = activeName === c.name;
            const label = isAr ? PROPERTY_TYPE_AR[c.name] ?? c.displayName : c.displayName;
            const countText = `${c.count} ${
              c.count === 1 ? t('common.property') : t('common.properties')
            }`;
            return (
              <Pressable
                key={c.slug}
                onPress={() => {
                  pauseAutoplay();
                  onSelect(active ? '' : c.name);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`rounded-xl px-3 py-4 items-center bg-white ${
                  active ? 'border-2 border-primary' : 'border border-line'
                }`}
                style={{
                  width: ITEM_WIDTH,
                  shadowColor: '#0f172a',
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}>
                <View className="w-14 h-14 rounded-2xl items-center justify-center mb-2">
                  <CategoryIcon name={c.name} size={38} color="#f1913d" />
                </View>
                <Text
                  numberOfLines={1}
                  className="text-[14px] font-bold text-center text-secondary"
                  style={{ letterSpacing: -0.2 }}>
                  {label}
                </Text>
                <Text className="text-[11px] mt-0.5 font-medium text-note">
                  {countText}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
