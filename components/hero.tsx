import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import type { SearchParams } from '@/lib/api';

import { FiltersSheet } from './filters-sheet';
import { FilterIcon, SendArrowIcon } from './icons/svg-icons';

type Status = '' | 'sale' | 'rent';

type Props = {
  value?: SearchParams;
  onSearch: (next: { keyword: string; status: Status }) => void;
  onApplyFilters?: (patch: Partial<SearchParams>) => void;
};

export function Hero({ value, onSearch, onApplyFilters }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [query, setQuery] = useState('');
  const status = (value?.status ?? '') as Status;
  const [filtersOpen, setFiltersOpen] = useState(false);

  const rawChips = t('hero.aiChips', { returnObjects: true }) as string[] | string;
  const chips = Array.isArray(rawChips) ? rawChips : [];

  // Rotating placeholder — crossfades through the i18n examples (mirrors the web
  // hero): starts on "Ask AI anything…", then "Type naturally…", then example
  // queries. Pauses the moment the user starts typing.
  const rawPlaceholders = t('hero.aiSearchPlaceholders', { returnObjects: true }) as string[] | string;
  const placeholders = Array.isArray(rawPlaceholders) ? rawPlaceholders : [];
  const isTyping = query.trim().length > 0;
  const [phIndex, setPhIndex] = useState(0);
  const phOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (isTyping || placeholders.length <= 1) return;
    const id = setInterval(() => {
      Animated.timing(phOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(() => {
        setPhIndex((i) => (i + 1) % placeholders.length);
        Animated.timing(phOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(id);
  }, [isTyping, placeholders.length, phOpacity]);
  const currentExample = placeholders.length > 0 ? placeholders[phIndex % placeholders.length] : t('hero.askAi');

  const search = (keyword: string) => onSearch({ keyword: keyword.trim(), status });
  const submit = () => search(query);
  const onChip = (c: string) => {
    setQuery(c);
    search(c);
  };

  return (
    <View>
      <View className="relative">
        {/* Property location-pin watermark (behind the text) */}
        <View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 4, opacity: 0.18 },
            isRTL ? { left: -8 } : { right: -8 },
          ]}>
          <HomesWatermark size={150} color="#f1913d" />
        </View>

        <View className="px-5 pt-5 pb-8">
          {/* Title */}
          <Text
            className="text-secondary text-[32px] font-extrabold leading-[40px]"
            style={{
              width: '60%',
              marginTop: 32,
              marginBottom: 16,
              alignSelf: isRTL ? 'flex-end' : 'flex-start',
              textAlign: isRTL ? 'right' : 'left',
              letterSpacing: -0.5,
            }}>
            {t('hero.title')}
          </Text>

          {/* AI prompt card — "Ask AI anything…" with short suggestion chips */}
          <View
            className="mt-5 border"
            style={{
              borderRadius: 24,
              backgroundColor: '#fff7f0',
              borderColor: '#f3e2d2',
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 12 },
              elevation: 9,
              paddingTop: 16,
              paddingHorizontal: 16,
              paddingBottom: 14,
            }}>
            {/* Prompt row: sparkle + input */}
            <View
              className="flex-row"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 10 }}>
              <Ionicons name="sparkles" size={20} color="#f1913d" style={{ marginTop: 5 }} />
              <View style={{ flex: 1, position: 'relative', justifyContent: 'center', minHeight: 30 }}>
                {/* Rotating placeholder kept in normal flow so a long example wraps
                    onto multiple lines (never truncated with an ellipsis) and grows
                    the field. The single-line input overlays it while empty, then
                    takes the flow once the user types. */}
                {!isTyping && currentExample ? (
                  <Animated.Text
                    pointerEvents="none"
                    style={{
                      paddingVertical: 4,
                      fontSize: 16,
                      lineHeight: 22,
                      color: '#cf9266',
                      textAlign: isRTL ? 'right' : 'left',
                      opacity: phOpacity,
                    }}>
                    {currentExample}
                  </Animated.Text>
                ) : null}
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  onSubmitEditing={submit}
                  returnKeyType="search"
                  accessibilityLabel={t('hero.subtitle')}
                  placeholderTextColor="transparent"
                  className="text-secondary"
                  style={[
                    { fontSize: 16, lineHeight: 22, paddingVertical: 4, textAlign: isRTL ? 'right' : 'left' },
                    isTyping ? null : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                  ]}
                />
              </View>
            </View>

            {/* Short suggestion chips — hidden once the user starts typing */}
            {chips.length > 0 && query.trim().length === 0 ? (
              <View
                className="flex-row flex-wrap mt-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                {chips.map((c, i) => (
                  <Pressable
                    key={`${c}-${i}`}
                    onPress={() => onChip(c)}
                    className="rounded-full border px-3.5 py-1.5 bg-white active:opacity-70"
                    style={{ borderColor: '#f1913d55' }}>
                    <Text className="text-primary text-[12px] font-semibold">{c}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* Bottom actions row — Filters chip + Send button */}
            <View
              className="flex-row items-center justify-between mt-3.5"
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

/**
 * Real-estate location-pin watermark: a map marker with a house inside it, plus
 * a couple of smaller listing pins to read as "properties on a map". Used faint
 * behind the hero title.
 */
function HomesWatermark({ size = 150, color = '#f1913d' }: { size?: number; color?: string }) {
  const VB_W = 160;
  const VB_H = 200;
  return (
    <Svg width={size} height={(size * VB_H) / VB_W} viewBox={`0 0 ${VB_W} ${VB_H}`} fill="none">
      {/* Ground shadow under the pin */}
      <Ellipse cx={80} cy={193} rx={26} ry={6} fill={color} fillOpacity={0.18} />

      {/* Main location pin */}
      <Path
        d="M80 16 C49 16 24 41 24 72 C24 108 62 150 80 192 C98 150 136 108 136 72 C136 41 111 16 80 16 Z"
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeOpacity={0.65}
      />

      {/* House inside the pin */}
      <Path d="M54 76 L80 50 L106 76 Z" fill={color} fillOpacity={0.7} />
      <Rect x={61} y={76} width={38} height={30} rx={2} fill={color} fillOpacity={0.6} />
      <Rect x={64} y={81} width={9} height={9} rx={1} fill={color} fillOpacity={0.9} />
      <Rect x={87} y={81} width={9} height={9} rx={1} fill={color} fillOpacity={0.9} />
      <Rect x={72} y={88} width={14} height={18} rx={1.5} fill={color} fillOpacity={0.9} />

      {/* Secondary listing pins */}
      <Circle cx={134} cy={112} r={7} fill={color} fillOpacity={0.3} />
      <Path d="M128 116 L134 129 L140 116 Z" fill={color} fillOpacity={0.3} />
      <Circle cx={134} cy={112} r={2.6} fill={color} fillOpacity={0.85} />

      <Circle cx={26} cy={92} r={5.5} fill={color} fillOpacity={0.26} />
      <Path d="M21 95 L26 105 L31 95 Z" fill={color} fillOpacity={0.26} />
      <Circle cx={26} cy={92} r={2} fill={color} fillOpacity={0.8} />
    </Svg>
  );
}
