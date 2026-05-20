import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useCities } from '@/apis/hooks';
import { resolveCityImageUrl } from '@/apis/city';

import { SectionHeader } from './section-header';

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
    <View className="py-5 bg-white">
      <SectionHeader
        title={t('citiesSection.title')}
        subtitle={t('citiesSection.subtitle')}
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
            const countLabel = `${c.count} ${
              c.count === 1 ? t('common.property') : t('common.properties')
            }`;
            return (
              <View key={c.city} className="w-1/2 p-1.5">
                <Pressable
                  onPress={() => onSelect(active ? '' : c.city)}
                  accessibilityRole="button"
                  style={{
                    height: 220,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#e8eaed',
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 15,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  }}>
                  {url ? (
                    <Image
                      source={{ uri: url }}
                      style={{ width: '100%', height: '100%', position: 'absolute' }}
                      contentFit="cover"
                      transition={150}
                    />
                  ) : null}

                  {/* Bottom gradient — matches web: 0 → 0.25 → 0.45 at 0.6 opacity */}
                  <LinearGradient
                    colors={[
                      'rgba(0,0,0,0)',
                      'rgba(0,0,0,0.25)',
                      'rgba(0,0,0,0.45)',
                    ]}
                    locations={[0, 0.7, 1]}
                    style={{ position: 'absolute', inset: 0, opacity: 0.6 }}
                  />

                  {/* Active ring */}
                  {active ? (
                    <View
                      className="absolute inset-0 border-2 border-primary"
                      style={{ borderRadius: 12 }}
                    />
                  ) : null}

                  {/* Bottom content — city name + orange count pill */}
                  <View className="absolute left-4 right-4 bottom-4">
                    <Text
                      numberOfLines={1}
                      style={{
                        color: '#ffffff',
                        fontSize: 17,
                        fontWeight: '700',
                        lineHeight: 22,
                        letterSpacing: -0.3,
                        textShadowColor: 'rgba(0,0,0,0.6)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 3,
                        textAlign: isAr ? 'right' : 'left',
                      }}>
                      {label}
                    </Text>
                    {/* Orange gradient count pill — matches web: 135deg #ff6b35 → #ff8c42 */}
                    <View
                      style={{
                        alignSelf: isAr ? 'flex-end' : 'flex-start',
                        marginTop: 8,
                        borderRadius: 25,
                        overflow: 'hidden',
                        shadowColor: '#ff6b35',
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                      }}>
                      <LinearGradient
                        colors={['#ff6b35', '#ff8c42']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ paddingHorizontal: 14, paddingVertical: 5 }}>
                        <Text
                          style={{
                            color: '#ffffff',
                            fontSize: 12,
                            fontWeight: '800',
                            letterSpacing: 0.2,
                          }}>
                          {countLabel}
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
