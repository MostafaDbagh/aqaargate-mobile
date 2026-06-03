import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';

import type { SearchParams } from '@/lib/api';

import { FiltersSheet } from './filters-sheet';
import { FilterIcon, SendArrowIcon } from './icons/svg-icons';

type Status = '' | 'sale' | 'rent';

type Props = {
  value?: SearchParams;
  onSearch: (next: { keyword: string; status: Status }) => void;
  onApplyFilters?: (patch: Partial<SearchParams>) => void;
};

const ROTATE_MS = 3000;
const FADE_MS = 260;

export function Hero({ value, onSearch, onApplyFilters }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [query, setQuery] = useState('');
  const status = (value?.status ?? '') as Status;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const placeholders = (t('hero.aiSearchPlaceholders', { returnObjects: true }) as
    | string[]
    | string) ?? [];
  const examples = Array.isArray(placeholders) ? placeholders : [];
  const [exampleIndex, setExampleIndex] = useState(0);
  const placeholderOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (query.length > 0 || focused || examples.length === 0) return;
    const id = setInterval(() => {
      Animated.timing(placeholderOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        setExampleIndex((i) => (i + 1) % examples.length);
        Animated.timing(placeholderOpacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true,
        }).start();
      });
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [query, focused, examples.length, placeholderOpacity]);

  const submit = () => onSearch({ keyword: query.trim(), status });

  const currentExample = examples[exampleIndex] ?? '';
  const showRotating = query.length === 0 && !focused && examples.length > 0;

  return (
    <View>
      <View className="relative overflow-hidden">
        <LinearGradient
          colors={['#1f2124', '#2c2e33', '#1f2124']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />
        {/* Decorative primary glow */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -90,
            right: -70,
            width: 260,
            height: 260,
            borderRadius: 260,
            backgroundColor: 'rgba(241, 145, 61, 0.22)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -120,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: 180,
            backgroundColor: 'rgba(241, 145, 61, 0.18)',
          }}
        />

        <View className="px-5 pt-5 pb-8">
          {/* Title */}
          <Text
            className="text-white text-[28px] font-extrabold leading-[34px]"
            style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.5 }}>
            {t('hero.title')}
          </Text>
          <Text
            className="text-white/65 text-[13px] mt-2 leading-[18px]"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('hero.tagline')}
          </Text>

          {/* Tall chat-style input */}
          <View
            className="bg-white mt-5"
            style={{
              borderRadius: 24,
              shadowColor: '#000',
              shadowOpacity: 0.28,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 14 },
              elevation: 10,
              height: 156,
              paddingTop: 18,
              paddingHorizontal: 18,
              paddingBottom: 14,
            }}>
            <View className="flex-1 justify-start">
              <TextInput
                value={query}
                onChangeText={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onSubmitEditing={submit}
                returnKeyType="search"
                multiline
                accessibilityLabel={t('hero.subtitle')}
                placeholder={showRotating ? '' : t('hero.searchPlaceholder')}
                placeholderTextColor="#a8abae"
                className="text-[16px] text-secondary leading-6"
                style={{
                  textAlign: isRTL ? 'right' : 'left',
                  textAlignVertical: 'top',
                  flex: 1,
                }}
              />
              {showRotating ? (
                <Animated.Text
                  pointerEvents="none"
                  numberOfLines={2}
                  className="text-note text-[16px] leading-6 absolute"
                  style={{
                    opacity: placeholderOpacity,
                    left: isRTL ? undefined : 0,
                    right: isRTL ? 0 : undefined,
                    top: 0,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                  {currentExample}
                </Animated.Text>
              ) : null}
            </View>

            {/* Bottom actions row — Filters chip + Send button */}
            <View
              className="flex-row items-center justify-between mt-2"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Pressable
                onPress={() => setFiltersOpen(true)}
                accessibilityLabel={t('hero.filtersTooltip')}
                className="flex-row items-center gap-2 px-3 py-2 rounded-xl border border-line bg-white active:bg-cream"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <FilterIcon size={16} color="#5c5e61" />
                <Text className="text-secondary text-[13px] font-semibold">
                  {t('hero.filters')}
                </Text>
                {status ? (
                  <View className="w-1.5 h-1.5 rounded-full bg-primary ml-0.5" />
                ) : null}
              </Pressable>

              <Pressable
                onPress={submit}
                accessibilityLabel={t('hero.send')}
                className="w-10 h-10 rounded-xl bg-black items-center justify-center active:opacity-80"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  shadowOffset: { width: 0, height: 1 },
                  elevation: 2,
                }}>
                <View style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}>
                  <SendArrowIcon size={18} color="#ffffff" />
                </View>
              </Pressable>
            </View>
          </View>

        </View>
      </View>

      <FiltersSheet
        visible={filtersOpen}
        value={value ?? {}}
        onApply={(next) => onApplyFilters?.(next)}
        onClose={() => setFiltersOpen(false)}
      />
    </View>
  );
}
