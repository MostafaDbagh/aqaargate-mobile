import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { localizeCity } from '@/constants/cities';

// Static list of summer/daily-rent hot spots (mirrors the web summer CTA).
const SUMMER_CITIES = ['Damascus', 'Latakia', 'Tartous', 'Homs', 'Hama'];

/** Promotional card linking to the daily-rent holiday-homes landing. */
export function SummerCta() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="px-5">
      <LinearGradient
        colors={['#ff8c42', '#f1913d', '#e06c2a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}>
        <View
          className="bg-white/20 rounded-full px-3 py-1"
          style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text className="text-white text-[11px] font-bold">{t('home.summerEyebrow')}</Text>
        </View>

        <Text
          className="text-white text-[26px] font-extrabold mt-3"
          style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.5 }}>
          {t('home.summerHeadline')}
        </Text>
        <Text
          className="text-white/90 text-[14px] font-medium mt-1.5"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('home.summerSubhead')}
        </Text>

        <View
          className="flex-row flex-wrap gap-2 mt-3"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {SUMMER_CITIES.map((c) => (
            <View key={c} className="bg-white/20 rounded-full px-2.5 py-1">
              <Text className="text-white text-[11px] font-semibold">
                {localizeCity(c, i18n.language)}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/holiday-homes' as never)}
          className="bg-white rounded-full px-4 py-2.5 mt-4 flex-row items-center gap-2 active:opacity-90"
          style={{
            alignSelf: isRTL ? 'flex-end' : 'flex-start',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}>
          <Text className="text-primary text-[13px] font-extrabold">{t('home.summerCta')}</Text>
          <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={15} color="#f1913d" />
        </Pressable>
      </LinearGradient>
    </View>
  );
}
