import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';

import { FiltersSheet } from './filters-sheet';
import { FilterIcon, SendArrowIcon, SparklesIcon, WarningIcon } from './icons/svg-icons';

type Status = '' | 'For Sale' | 'For Rent';

type Props = {
  onSearch: (next: { keyword: string; status: Status }) => void;
};

// Match web: rotate every 3s, 320ms opacity fade.
const ROTATE_MS = 3000;
const FADE_MS = 320;

export function Hero({ onSearch }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [emptyWarn, setEmptyWarn] = useState(false);

  // Rotating AI-search placeholders (verbatim from web messages)
  const placeholders = (t('hero.aiSearchPlaceholders', { returnObjects: true }) as
    | string[]
    | string) ?? [];
  const examples = Array.isArray(placeholders) ? placeholders : [];
  const [exampleIndex, setExampleIndex] = useState(0);
  const placeholderOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (query.length > 0 || examples.length === 0) return;
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
  }, [query, examples.length, placeholderOpacity]);

  const submit = () => {
    const k = query.trim();
    if (!k && !status) {
      setEmptyWarn(true);
      return;
    }
    setEmptyWarn(false);
    onSearch({ keyword: k, status });
  };

  const handleStatusChange = (next: Status) => {
    setStatus(next);
    onSearch({ keyword: query.trim(), status: next });
  };

  const currentPlaceholder = examples[exampleIndex] ?? t('hero.searchPlaceholder');
  const showRotating = query.length === 0 && examples.length > 0;

  return (
    <View className="bg-brand">
      {/* Dark gradient overlay — matches web's rgba(0,0,0,0.55) on hero image */}
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.85)']}
        className="px-5 pt-6 pb-7">
        <Text
          className="text-white text-2xl font-extrabold leading-8"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('hero.title')}
        </Text>

        {/* Search wrapper */}
        <View className="mt-5">
          {/* AI Search badge — gradient pill, sits above the input, matches web heroSearchBadge */}
          <View
            className="self-start -mb-3 z-10 rounded-full overflow-hidden"
            style={{ marginStart: 16 }}>
            <LinearGradient
              colors={['#fb923c', '#f97316', '#ea580c', '#c2410c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-3 py-1.5 flex-row items-center gap-1.5">
              <Text className="text-white text-xs font-bold">
                {t('hero.subtitle')}
              </Text>
              <SparklesIcon size={14} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Chat input — white rounded form with bottom actions row */}
          <View
            className="bg-white rounded-3xl border border-gray-200 pt-7 px-4 pb-3"
            style={{
              shadowColor: '#0f172a',
              shadowOpacity: 0.15,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
              elevation: 8,
            }}>
            <View className="min-h-[88px]">
              <TextInput
                value={query}
                onChangeText={(v) => {
                  setQuery(v);
                  if (emptyWarn && v.length > 0) setEmptyWarn(false);
                }}
                onSubmitEditing={submit}
                returnKeyType="search"
                multiline
                accessibilityLabel={t('hero.subtitle')}
                placeholder={showRotating ? '' : t('hero.searchPlaceholder')}
                placeholderTextColor="#9ca3af"
                className="text-base text-gray-900 leading-6"
                style={{
                  textAlign: isRTL ? 'right' : 'left',
                  textAlignVertical: 'top',
                  minHeight: 64,
                }}
              />
              {showRotating ? (
                <Animated.Text
                  pointerEvents="none"
                  numberOfLines={2}
                  className="text-gray-400 text-base leading-6 absolute top-0 left-0 right-0"
                  style={{
                    opacity: placeholderOpacity,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                  {currentPlaceholder}
                </Animated.Text>
              ) : null}
            </View>

            {/* Actions row — Filters chip on the leading edge, Send on trailing */}
            <View
              className="flex-row items-center justify-between mt-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Pressable
                onPress={() => setFiltersOpen(true)}
                accessibilityLabel={t('hero.filtersTooltip')}
                className="flex-row items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white active:bg-slate-50"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <FilterIcon size={18} color="#334155" />
                <Text className="text-slate-700 text-sm font-medium">{t('hero.filters')}</Text>
                {status ? (
                  <View className="w-2 h-2 rounded-full bg-orange-500 ml-1" />
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
                }}>
                <SendArrowIcon
                  size={18}
                  color="#ffffff"
                />
              </Pressable>
            </View>
          </View>

          {emptyWarn ? (
            <View
              className="mt-3 flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <WarningIcon size={16} color="#b91c1c" />
              <Text className="text-red-700 text-sm flex-1">{t('hero.emptyWarning')}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <FiltersSheet
        visible={filtersOpen}
        value={status}
        onSelect={handleStatusChange}
        onClose={() => setFiltersOpen(false)}
      />
    </View>
  );
}
