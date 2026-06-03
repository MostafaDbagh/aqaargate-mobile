import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExtendedListing } from '@/apis/listing';
import { getCitySlug } from '@/constants/cities';
import { slugForPropertyType } from '@/lib/property-type-config';

import { MessageAgentModal } from './message-agent-modal';

const barShadow: ViewStyle = {
  shadowColor: '#2c2e33',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: -6 },
  elevation: 10,
};

export function DetailActionBar({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const rowDir = isAr ? 'row-reverse' : 'row';
  const [messageOpen, setMessageOpen] = useState(false);

  const onShare = async () => {
    // Canonical web URL: /property-detail/{citySlug}/{typeSlug}/{id} (mirrors web buildPropertyHref)
    const citySlug = getCitySlug(listing.city ?? listing.state) || 'syria';
    const typeSlug = slugForPropertyType(listing.propertyType) || 'property';
    const url = `https://aqaargate.com/property-detail/${citySlug}/${typeSlug}/${listing._id}`;
    await Share.share({
      message: `${listing.propertyKeyword ?? listing.propertyType ?? 'Property'} — ${url}`,
      url,
    });
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      className="absolute left-0 right-0 bottom-0 bg-white"
      style={{ borderTopWidth: 1, borderTopColor: 'rgba(44, 46, 51, 0.06)', ...barShadow }}>
      <View className="items-center gap-3 px-4 py-3" style={{ flexDirection: rowDir }}>
        {/* Share — secondary */}
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel={t('propertyDetail.share')}
          className="flex-1 active:opacity-80">
          <View
            className="items-center justify-center bg-white border border-line"
            style={{
              flexDirection: rowDir,
              gap: 8,
              borderRadius: 18,
              paddingVertical: 14,
              shadowColor: '#2c2e33',
              shadowOpacity: 0.06,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}>
            <Ionicons name="share-social-outline" size={19} color="#2c2e33" />
            <Text className="text-secondary text-[15px] font-bold" style={{ letterSpacing: -0.2 }}>
              {t('propertyDetail.share')}
            </Text>
          </View>
        </Pressable>

        {/* Message — primary (opens the inquiry modal) */}
        <Pressable
          onPress={() => setMessageOpen(true)}
          className="flex-1 active:opacity-90"
          style={{
            shadowColor: '#f1913d',
            shadowOpacity: 0.4,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 5 },
            elevation: 5,
          }}>
          <LinearGradient
            colors={['#f6a85c', '#ed8a2e']}
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
            <Ionicons name="chatbubble-ellipses" size={19} color="#ffffff" />
            <Text className="text-white text-[15px] font-bold" style={{ letterSpacing: -0.2 }}>
              {t('propertyDetail.sendMessage')}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <MessageAgentModal
        visible={messageOpen}
        onClose={() => setMessageOpen(false)}
        listing={listing}
      />
    </SafeAreaView>
  );
}
