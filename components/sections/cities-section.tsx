import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useCities } from '@/apis/hooks';
import { resolveCityImageUrl } from '@/apis/city';

import { SectionHeader } from './section-header';

// Arabic city names — web translates via translateCity(); same idea here.
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
    <View className="bg-white py-8">
      <SectionHeader
        title={t('citiesSection.title')}
        subtitle={t('citiesSection.subtitle')}
        align="center"
      />

      {isLoading ? (
        <View className="h-[200px] items-center justify-center">
          <ActivityIndicator color="#f1913d" />
        </View>
      ) : (
        <View className="px-5 flex-row flex-wrap" style={{ marginHorizontal: -6 }}>
          {cities.slice(0, 6).map((c) => {
            const url = resolveCityImageUrl(c.imageSrc);
            const label = isAr ? CITY_AR[c.city] ?? c.displayName : c.displayName;
            const active = activeCity === c.city;
            return (
              <View key={c.city} className="w-1/2 p-1.5">
                <Pressable
                  onPress={() => onSelect(active ? '' : c.city)}
                  accessibilityRole="button"
                  className="rounded-2xl overflow-hidden bg-cream"
                  style={{
                    height: 180,
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.12,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}>
                  {url ? (
                    <Image
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%', position: 'absolute' }}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : (
                    <View className="absolute inset-0 bg-line" />
                  )}
                  {/* Bottom dark gradient — matches web's cityOverlay */}
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      'rgba(0,0,0,0.25)',
                      active ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.45)',
                    ]}
                    locations={[0, 0.7, 1]}
                    style={{ position: 'absolute', inset: 0 }}
                  />

                  {/* Active border ring */}
                  {active ? (
                    <View className="absolute inset-0 border-2 border-primary rounded-2xl" />
                  ) : null}

                  <View className="absolute left-3 right-3 bottom-3">
                    <Text
                      numberOfLines={1}
                      className="text-white text-base font-bold"
                      style={{
                        textShadowColor: 'rgba(0,0,0,0.6)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 4,
                      }}>
                      {label}
                    </Text>
                    {/* Orange count pill — web uses 135deg #ff6b35 → #ff8c42 */}
                    <View className="self-start mt-1 rounded-full overflow-hidden">
                      <LinearGradient
                        colors={['#ff6b35', '#ff8c42']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="px-2.5 py-0.5">
                        <Text className="text-white text-xs font-bold">
                          {c.count}{' '}
                          {c.count === 1 ? t('common.property') : t('common.properties')}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
