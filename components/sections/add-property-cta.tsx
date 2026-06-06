import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Mirrors the canonical WhatsApp number in app/contact.tsx (PHONE_E164).
const OWNER_WHATSAPP = '+971586057772';
const WHATSAPP_COLORS = ['#2bd96b', '#17b85a'] as const;

/**
 * Decorative house watermark — the brand-coloured stand-in for the template's
 * cookie illustration. The door and two windows are true holes (evenodd fill)
 * so the dark gradient shows through.
 */
function HouseWatermark({ size = 158, color = '#f1913d' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
      <Path
        fillRule="evenodd"
        d="M50 12 L88 46 L82 46 L82 88 L18 88 L18 46 L12 46 Z M44 62 H56 V88 H44 Z M28 56 H40 V68 H28 Z M60 56 H72 V68 H60 Z"
      />
    </Svg>
  );
}

/**
 * Owner-acquisition promo card shown on the home feed.
 * Primary CTA opens WhatsApp; the secondary link routes to the "become an
 * agent" contact flow so owners can self-serve their own listings.
 */
export function AddPropertyCta() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const openWhatsApp = () => {
    const text = encodeURIComponent(t('home.listWhatsappMessage'));
    Linking.openURL(`https://wa.me/${OWNER_WHATSAPP.replace(/[^0-9]/g, '')}?text=${text}`);
  };

  return (
    <View className="px-5">
      <LinearGradient
        colors={['#33363d', '#2c2e33', '#26282d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}>
        {/* brand house watermark (replaces the template's cookie) */}
        <View
          pointerEvents="none"
          style={[
            { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', opacity: 0.16 },
            isRTL ? { left: -22 } : { right: -22 },
          ]}>
          <HouseWatermark size={158} color="#f1913d" />
        </View>

        <View
          className="bg-primary rounded-full px-3 py-1"
          style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text className="text-white text-[11px] font-bold">{t('home.listEyebrow')}</Text>
        </View>

        <Text
          className="text-white text-[22px] font-extrabold mt-3"
          style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.5, maxWidth: '82%' }}>
          {t('home.listHeadline')}
        </Text>
        <Text
          className="text-white/75 text-[13px] font-medium mt-1.5"
          style={{ textAlign: isRTL ? 'right' : 'left', maxWidth: '84%', lineHeight: 19 }}>
          {t('home.listSubhead')}
        </Text>

        <Pressable
          onPress={openWhatsApp}
          className="mt-4 active:opacity-90"
          style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
          <LinearGradient
            colors={WHATSAPP_COLORS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: isRTL ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 8,
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 11,
            }}>
            <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
            <Text className="text-white text-[13px] font-extrabold">{t('home.listCta')}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({ pathname: '/contact', params: { interest: 'becomeAgent' } } as never)
          }
          className="mt-3 active:opacity-70"
          style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text
            className="text-primary text-[12.5px] font-bold"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('home.listAgentLink')}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
