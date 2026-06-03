import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExtendedListing } from '@/apis/listing';

const CALL_COLORS = ['#f6a85c', '#ed8a2e'] as const;
const WHATSAPP_COLORS = ['#2bd96b', '#17b85a'] as const;

export function StickyCta({ listing }: { listing: ExtendedListing }) {
  const { t } = useTranslation();
  const phone = listing.agentNumber;
  const whatsapp = listing.agentWhatsapp;
  const email = listing.agentEmail;

  if (!phone && !whatsapp && !email) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      className="absolute left-0 right-0 bottom-0 bg-white"
      style={{
        borderTopWidth: 1,
        borderTopColor: 'rgba(44, 46, 51, 0.06)',
        shadowColor: '#2c2e33',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -6 },
        elevation: 10,
      }}>
      <View className="flex-row items-center gap-3 px-4 py-3">
        {phone ? (
          <CtaButton
            icon="call"
            label={t('propertyDetail.call')}
            colors={CALL_COLORS}
            glow="#f1913d"
            onPress={() => Linking.openURL(`tel:${phone}`)}
          />
        ) : null}
        {whatsapp ? (
          <CtaButton
            icon="logo-whatsapp"
            label="WhatsApp"
            colors={WHATSAPP_COLORS}
            glow="#17b85a"
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${whatsapp.replace(/[^\d+]/g, '').replace('+', '')}`
              )
            }
          />
        ) : email ? (
          <CtaButton
            icon="mail"
            label={t('propertyDetail.email')}
            colors={CALL_COLORS}
            glow="#f1913d"
            onPress={() => Linking.openURL(`mailto:${email}`)}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function CtaButton({
  icon,
  label,
  colors,
  glow,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: readonly [string, string];
  glow: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        opacity: pressed ? 0.92 : 1,
        shadowColor: glow,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
      })}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 18,
          paddingVertical: 15,
        }}>
        <Ionicons name={icon} size={19} color="#ffffff" />
        <Text className="text-white text-[15px] font-bold" style={{ letterSpacing: -0.2 }}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
