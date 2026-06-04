import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

export type SocialItem = {
  key: 'facebook' | 'linkedin' | 'instagram';
  url: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  brand: string;
};

export const SOCIALS: SocialItem[] = [
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

export function SocialButton({ item, label }: { item: SocialItem; label: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(item.url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: item.brand,
        shadowColor: item.brand,
        shadowOpacity: pressed ? 0.2 : 0.3,
        shadowRadius: pressed ? 5 : 10,
        shadowOffset: { width: 0, height: pressed ? 2 : 5 },
        elevation: pressed ? 1 : 3,
        transform: [{ scale: pressed ? 0.9 : 1 }],
      })}>
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 25,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.22)',
          overflow: 'hidden',
        }}>
        <Ionicons name={item.icon} size={23} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

export function SocialMediaBar() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="px-6 pt-2 pb-8 bg-white">
      <Text
        className="text-secondary text-[18px] font-extrabold tracking-tight"
        style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('socialMedia.title')}
      </Text>
      <Text
        className="text-note text-[13px] mt-1.5 leading-[19px]"
        style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {t('socialMedia.subtitle')}
      </Text>

      <View
        className="flex-row items-center mt-5"
        style={{
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: 16,
          alignSelf: isRTL ? 'flex-end' : 'flex-start',
        }}>
        {SOCIALS.map((s) => (
          <SocialButton key={s.key} item={s} label={t(`socialMedia.${s.key}`)} />
        ))}
      </View>
    </View>
  );
}
