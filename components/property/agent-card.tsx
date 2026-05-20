import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import type { ExtendedListing } from '@/apis/listing';

import { SectionTitle } from './specs-grid';

export function AgentCard({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const name = (isAr && listing.agentName_ar) || listing.agentName || 'Agent';
  const phone = listing.agentNumber;
  const email = listing.agentEmail;
  const whatsapp = listing.agentWhatsapp;
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.contactAgent')} />
      <View
        className="bg-white border border-line rounded-xl p-3.5"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}>
        <View className="flex-row items-center gap-2.5">
          <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
            <Text className="text-white text-[16px] font-extrabold">{initials || 'A'}</Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-secondary text-[15px] font-bold"
              style={{ letterSpacing: -0.2 }}>
              {name}
            </Text>
            <Text
              className="text-note text-[11px] font-bold uppercase mt-0.5"
              style={{ letterSpacing: 0.5 }}>
              {t('propertyDetail.propertyAgent')}
            </Text>
          </View>
        </View>

        <View className="mt-3 gap-1.5">
          {phone ? (
            <ContactRow
              icon="call-outline"
              label={phone}
              onPress={() => Linking.openURL(`tel:${phone}`)}
            />
          ) : null}
          {email ? (
            <ContactRow
              icon="mail-outline"
              label={email}
              onPress={() => Linking.openURL(`mailto:${email}`)}
            />
          ) : null}
          {whatsapp ? (
            <ContactRow
              icon="logo-whatsapp"
              label={whatsapp}
              tint="#25D366"
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${whatsapp.replace(/[^\d+]/g, '').replace('+', '')}`
                )
              }
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ContactRow({
  icon,
  label,
  tint = '#f1913d',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2.5 bg-cream rounded-lg px-2.5 py-2.5 active:bg-primary-50">
      <View
        className="w-8 h-8 rounded-md items-center justify-center"
        style={{ backgroundColor: `${tint}1A` }}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text className="flex-1 text-secondary text-[12px] font-semibold" numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color="#a8abae" />
    </Pressable>
  );
}
