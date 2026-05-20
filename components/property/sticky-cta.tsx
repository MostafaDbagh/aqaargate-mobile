import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExtendedListing } from '@/apis/listing';

export function StickyCta({ listing }: { listing: ExtendedListing }) {
  const { t } = useTranslation();
  const phone = listing.agentNumber;
  const whatsapp = listing.agentWhatsapp;
  const email = listing.agentEmail;

  if (!phone && !whatsapp && !email) return null;

  return (
    <SafeAreaView
      edges={['bottom']}
      className="absolute left-0 right-0 bottom-0 bg-white border-t border-line"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
      }}>
      <View className="flex-row items-center gap-2 px-4 py-2.5">
        {phone ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${phone}`)}
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-white border border-primary rounded-lg py-2.5 active:bg-primary-50">
            <Ionicons name="call-outline" size={15} color="#f1913d" />
            <Text
              className="text-primary text-[13px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              {t('propertyDetail.call')}
            </Text>
          </Pressable>
        ) : null}
        {whatsapp ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${whatsapp.replace(/[^\d+]/g, '').replace('+', '')}`
              )
            }
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 active:opacity-80"
            style={{ backgroundColor: '#25D366' }}>
            <Ionicons name="logo-whatsapp" size={15} color="#ffffff" />
            <Text
              className="text-white text-[13px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              WhatsApp
            </Text>
          </Pressable>
        ) : email ? (
          <Pressable
            onPress={() => Linking.openURL(`mailto:${email}`)}
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-primary rounded-lg py-2.5 active:opacity-80">
            <Ionicons name="mail-outline" size={15} color="#ffffff" />
            <Text
              className="text-white text-[13px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              {t('propertyDetail.email')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
