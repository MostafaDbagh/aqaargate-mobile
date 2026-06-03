import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';

import { useCities } from '@/apis/hooks';
import { resolveCityImageUrl } from '@/apis/city';
import { EN_TO_AR_CITY } from '@/constants/cities';
import { ShimmerOverlay, SkeletonBlock } from '@/components/skeletons/listing-skeleton';

import { SectionHeader } from './section-header';

// Fallback for cities not in the canonical constants/cities.ts set (web source
// of truth). Canonical names resolve via EN_TO_AR_CITY first.
const CITY_AR: Record<string, string> = {
  Damascus: 'دمشق',
  Latakia: 'اللاذقية',
  Aleppo: 'حلب',
  Homs: 'حمص',
  Hama: 'حماة',
  Tartus: 'طرطوس',
  Idlib: 'إدلب',
  Raqqa: 'الرقة',
  'Deir ez-zur': 'دير الزور',
  Hasakah: 'الحسكة',
  Quneitra: 'القنيطرة',
  Daraa: 'درعا',
  Suwayda: 'السويداء',
};

const THUMB = 64;

const thumbShadow: ViewStyle = {
  shadowColor: '#0f172a',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 3,
};

type Props = {
  activeCity?: string;
  onSelect: (city: string) => void;
};

export function CitiesSection({ activeCity, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: cities = [], isLoading, isError } = useCities();

  if (isError && cities.length === 0) return null;

  return (
    <View className="py-5 bg-white">
      <SectionHeader title={t('citiesSection.title')} subtitle={t('citiesSection.subtitle')} />

      {isLoading ? (
        <View
          className="flex-row px-5"
          style={{ gap: 18, position: 'relative', overflow: 'hidden' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View
              key={i}
              className="flex-row items-center"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 12 }}>
              <SkeletonBlock style={{ width: THUMB, height: THUMB, borderRadius: 16 }} />
              <View>
                <SkeletonBlock style={{ width: 84, height: 15 }} />
                <SkeletonBlock className="mt-2" style={{ width: 62, height: 12 }} />
              </View>
            </View>
          ))}
          <ShimmerOverlay />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 22 }}>
          {cities.slice(0, 10).map((c) => {
            const url = resolveCityImageUrl(c.imageSrc);
            const label = isAr ? EN_TO_AR_CITY[c.city] ?? CITY_AR[c.city] ?? c.displayName : c.displayName;
            const active = activeCity === c.city;
            const countLabel = `${c.count} ${
              c.count === 1 ? t('common.property') : t('common.properties')
            }`;
            return (
              <Pressable
                key={c.city}
                onPress={() => onSelect(active ? '' : c.city)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className="flex-row items-center active:opacity-80"
                style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 12 }}>
                {/* Thumbnail */}
                <View style={[{ borderRadius: 16 }, thumbShadow]}>
                  <View
                    style={{
                      width: THUMB,
                      height: THUMB,
                      borderRadius: 16,
                      overflow: 'hidden',
                      borderWidth: active ? 2 : 0,
                      borderColor: '#f1913d',
                      backgroundColor: '#e8eaed',
                    }}>
                    {url ? (
                      <Image
                        source={{ uri: url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={150}
                      />
                    ) : null}
                  </View>
                </View>

                {/* Name + count */}
                <View>
                  <Text
                    numberOfLines={1}
                    className="text-secondary text-[16px] font-extrabold"
                    style={{ letterSpacing: -0.3, textAlign: isAr ? 'right' : 'left' }}>
                    {label}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-note text-[13px] font-medium mt-0.5"
                    style={{ textAlign: isAr ? 'right' : 'left' }}>
                    {countLabel}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
