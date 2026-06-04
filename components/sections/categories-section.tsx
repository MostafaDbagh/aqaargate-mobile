import { MaterialCommunityIcons } from '@expo/vector-icons';
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

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Icon per canonical property-type `name` (English key works in both locales). */
const TYPE_ICON: Record<string, IconName> = {
  Apartment: 'home-city-outline',
  Villa: 'home-outline',
  Building: 'office-building-outline',
  Office: 'briefcase-outline',
  Commercial: 'storefront-outline',
  Land: 'terrain',
  'Holiday Home': 'beach',
  Chalet: 'home-roof',
  // Legacy / synonym values that may still appear in BE data.
  House: 'home-outline',
  Studio: 'bed-outline',
  Farm: 'barn',
  Duplex: 'home-city-outline',
  Penthouse: 'home-city-outline',
  Warehouse: 'warehouse',
  Shop: 'storefront-outline',
  Store: 'storefront-outline',
};

const iconForType = (name?: string): IconName =>
  (name && TYPE_ICON[name]) || 'home-outline';

function CategoryChip({
  label,
  icon,
  active,
  isAr,
  onPress,
}: {
  label: string;
  icon: IconName;
  active: boolean;
  isAr: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: isAr ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 11,
        paddingHorizontal: 18,
      }}>
      {active ? (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#f1913d',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialCommunityIcons name="check" size={15} color="#ffffff" />
        </View>
      ) : (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#d1d5db',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <MaterialCommunityIcons name={icon} size={15} color="#9ca3af" />
        </View>
      )}
      <Text
        numberOfLines={1}
        className="text-[15px]"
        style={{
          letterSpacing: -0.2,
          fontWeight: active ? '700' : '600',
          color: active ? '#1f2937' : '#6b7280',
        }}>
        {label}
      </Text>
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
            icon="view-grid-outline"
            isAr={isAr}
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
                icon={iconForType(c.name)}
                isAr={isAr}
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
