import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

type SocialItem = {
  key: 'facebook' | 'linkedin' | 'instagram';
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  brand: string;
};

const SOCIALS: SocialItem[] = [
  {
    key: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61585950591929',
    icon: 'logo-facebook',
    gradient: ['#1877F2', '#0a5dc7'],
    brand: '#1877F2',
  },
  {
    key: 'instagram',
    url: 'https://www.instagram.com/aqaar_gate/',
    icon: 'logo-instagram',
    gradient: ['#f58529', '#dd2a7b'],
    brand: '#E1306C',
  },
  {
    key: 'linkedin',
    url: 'https://www.linkedin.com/company/aqaargate',
    icon: 'logo-linkedin',
    gradient: ['#0077B5', '#005a8d'],
    brand: '#0077B5',
  },
];

export function SocialMediaBar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="px-5 py-6 bg-white">
      <View
        className="rounded-3xl px-5 py-5 border border-line bg-cream/40"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 1,
        }}>
        <View
          className="flex-row items-center justify-between"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <View className="flex-1">
            <Text
              className="text-secondary text-[16px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('socialMedia.title')}
            </Text>
            <Text
              className="text-note text-[12px] mt-1"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('socialMedia.subtitle')}
            </Text>
          </View>
          <View
            className="flex-row items-center gap-2.5"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            {SOCIALS.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => Linking.openURL(s.url)}
                accessibilityRole="link"
                accessibilityLabel={t(`socialMedia.${s.key}`)}
                className="w-11 h-11 rounded-full items-center justify-center active:opacity-80"
                style={{
                  backgroundColor: s.brand,
                  shadowColor: s.brand,
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}>
                <Ionicons name={s.icon} size={20} color="#ffffff" />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
