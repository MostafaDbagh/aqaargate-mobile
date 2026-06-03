import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  I18nManager,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useCategories } from '@/apis/hooks';
import { ChipsRowSkeleton } from '@/components/skeletons/screen-skeletons';
import { localizePropertyType } from '@/constants/property-types';

import { SectionHeader } from './section-header';

const ITEM_WIDTH = 160;
const ITEM_GAP = 12;
const STEP = ITEM_WIDTH + ITEM_GAP;
const AUTOPLAY_DELAY_MS = 2500;
const RESUME_AFTER_INTERACTION_MS = 5000;

/** Soft lift for the unselected chips. */
const chipShadow: ViewStyle = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

/** Simple frosted-glass surface for unselected chips. */
const glassChip: ViewStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  borderWidth: 1,
  borderColor: 'rgba(44, 46, 51, 0.08)',
};

/** Brand-orange glow under the selected (gradient) chip. */
const activeShadow: ViewStyle = {
  shadowColor: '#f1913d',
  shadowOpacity: 0.35,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

/** Pill chip: gradient + glow when selected, frosted glass when not. */
const CHIP_PAD = { paddingHorizontal: 24, paddingVertical: 14 } as const;

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={active ? activeShadow : undefined}>
      {active ? (
        <LinearGradient
          colors={['#f6a85c', '#ed8a2e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.4)',
            alignItems: 'center',
            justifyContent: 'center',
            ...CHIP_PAD,
          }}>
          <Text
            numberOfLines={1}
            className="text-white text-[15px] font-bold"
            style={{ letterSpacing: -0.2 }}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <View
          className="items-center justify-center"
          style={[chipShadow, glassChip, { borderRadius: 999, ...CHIP_PAD }]}>
          <Text
            numberOfLines={1}
            className="text-secondary text-[15px] font-bold"
            style={{ letterSpacing: -0.2 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

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
        <ChipsRowSkeleton count={6} />
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: ITEM_GAP, alignItems: 'center' }}
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
          {/* "All" — clears the type filter; active when nothing is selected. */}
          <CategoryChip
            label={t('categoriesSection.all')}
            active={!activeName}
            onPress={() => {
              pauseAutoplay();
              onSelect('');
            }}
          />

          {categories.map((c) => {
            const active = activeName === c.name;
            const label = isAr
              ? localizePropertyType(c.name, 'ar') ?? c.displayName
              : c.displayName;
            return (
              <CategoryChip
                key={c.slug}
                label={label}
                active={active}
                onPress={() => {
                  pauseAutoplay();
                  onSelect(active ? '' : c.name);
                }}
              />
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
