import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import type { ExtendedListing } from '@/apis/listing';

import { MessageAgentModal } from './message-agent-modal';
import { SectionTitle } from './specs-grid';

export function AgentCard({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const rowDir = isAr ? 'row-reverse' : 'row';
  const [messageOpen, setMessageOpen] = useState(false);

  const agentObj =
    typeof listing.agentId === 'object' && listing.agentId ? listing.agentId : null;

  const name =
    (isAr && listing.agentName_ar) ||
    listing.agentName ||
    [agentObj?.firstName, agentObj?.lastName].filter(Boolean).join(' ') ||
    'Agent';
  const avatar = agentObj?.avatar || undefined;
  const verified = !!agentObj?.isTrueAgent;
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
        className="bg-cream rounded-3xl p-3"
        style={{
          borderWidth: 1,
          borderColor: 'rgba(44, 46, 51, 0.05)',
          shadowColor: '#2c2e33',
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 3,
        }}>
        <View className="items-center gap-3" style={{ flexDirection: rowDir }}>
          {/* Avatar — photo if available, else gradient initials */}
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#fdefe2' }}
              contentFit="cover"
              transition={150}
            />
          ) : (
            <LinearGradient
              colors={['#f6a85c', '#ed8a2e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 54,
                height: 54,
                borderRadius: 27,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text className="text-white text-[17px] font-extrabold">{initials || 'A'}</Text>
            </LinearGradient>
          )}

          {/* Name + verified / role */}
          <View className="flex-1">
            <Text
              className="text-secondary text-[15px] font-bold"
              numberOfLines={1}
              style={{ letterSpacing: -0.3, textAlign: isAr ? 'right' : 'left' }}>
              {name}
            </Text>
            <View
              className="items-center gap-1 mt-0.5"
              style={{ flexDirection: rowDir }}>
              {verified ? (
                <>
                  <Ionicons name="checkmark-circle" size={14} color="#06a788" />
                  <Text className="text-[12px] font-semibold" style={{ color: '#06a788' }}>
                    {t('agentsScreen.verified')}
                  </Text>
                </>
              ) : (
                <Text
                  className="text-note text-[11px] font-bold uppercase"
                  style={{ letterSpacing: 0.5 }}>
                  {t('propertyDetail.propertyAgent')}
                </Text>
              )}
            </View>
          </View>

          {/* Round action buttons: contact (message) · email · whatsapp */}
          <View className="items-center gap-2" style={{ flexDirection: rowDir }}>
            <RoundAction
              icon="chatbubble-ellipses"
              color="#f1913d"
              accessibilityLabel={t('propertyDetail.contactAgent')}
              onPress={() => setMessageOpen(true)}
            />
            {email ? (
              <RoundAction
                icon="mail"
                color="#7695ff"
                accessibilityLabel={t('propertyDetail.email')}
                onPress={() => Linking.openURL(`mailto:${email}`)}
              />
            ) : null}
            {whatsapp ? (
              <RoundAction
                icon="logo-whatsapp"
                color="#25D366"
                accessibilityLabel="WhatsApp"
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

      <MessageAgentModal
        visible={messageOpen}
        onClose={() => setMessageOpen(false)}
        listing={listing}
      />
    </View>
  );
}

function RoundAction({
  icon,
  color,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="active:opacity-80">
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}>
        <Ionicons name={icon} size={20} color="#ffffff" />
      </View>
    </Pressable>
  );
}
