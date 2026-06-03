import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { CITIES } from '@/constants/cities';

/**
 * Text-pill strip linking every major Syrian city to the buy list, regardless
 * of whether the API returned listings for it (mirrors the web home city strip).
 */
export function CityLinksStrip() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const cities = CITIES.filter((c) => c.slug);

  return (
    <View className="px-5">
      <Text
        className="text-secondary text-[14px] font-bold mb-2.5"
        style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('home.browseByCity')}
      </Text>
      <View
        className="flex-row flex-wrap gap-2"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {cities.map((c) => (
          <Pressable
            key={c.slug}
            onPress={() =>
              router.push({ pathname: '/(tabs)/property-list', params: { city: c.en } })
            }
            className="bg-cream border border-line rounded-full px-3.5 py-2 active:bg-primary-50">
            <Text className="text-secondary text-[13px] font-semibold">{isRTL ? c.ar : c.en}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
