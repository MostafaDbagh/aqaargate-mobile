import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, Text, View } from 'react-native';

import { LocationIcon } from '@/components/icons/svg-icons';
import { useGuestPrivacy } from '@/hooks/use-guest-privacy';
import type { ExtendedListing } from '@/apis/listing';

import { SectionTitle } from './specs-grid';

function buildMapsUrl(listing: ExtendedListing): string {
  if (listing.mapLocation && /^https?:\/\//i.test(listing.mapLocation)) {
    return listing.mapLocation;
  }
  const parts = [listing.address, listing.neighborhood, listing.city, listing.country]
    .filter(Boolean)
    .join(', ');
  const q = encodeURIComponent(parts || (listing.city ?? 'Syria'));
  // iOS prefers maps://, but http maps URL works on both via deep linking
  return Platform.OS === 'ios'
    ? `http://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function Location({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  // Guests on an agent-published listing don't get the exact address or the map.
  const { isProtected, promptLogin } = useGuestPrivacy(listing);

  const address = (isAr && listing.address_ar) || listing.address || '';
  const neighborhood = (isAr && listing.neighborhood_ar) || listing.neighborhood || '';
  const city = listing.city ?? listing.state ?? '';
  const country = listing.country ?? '';

  if (!address && !city) return null;

  // General area (neighborhood · city · country) stays visible — only the exact
  // street address + the deep-link to Maps are gated.
  const area = [neighborhood, city, country].filter(Boolean).join(' · ');

  if (isProtected) {
    return (
      <View className="px-5 mt-6">
        <SectionTitle title={t('propertyDetail.location')} />
        <Pressable
          onPress={promptLogin}
          accessibilityRole="button"
          className="bg-cream border border-line rounded-xl p-3.5 flex-row items-center gap-3 active:bg-primary-50">
          <View className="w-10 h-10 rounded-lg bg-secondary items-center justify-center">
            <Ionicons name="lock-closed" size={18} color="#ffffff" />
          </View>
          <View className="flex-1">
            {area ? (
              <Text
                className="text-secondary text-[15px] font-bold"
                numberOfLines={2}
                style={{ textAlign: isAr ? 'right' : 'left' }}>
                {area}
              </Text>
            ) : null}
            <Text
              className="text-text text-[13px] mt-0.5"
              numberOfLines={2}
              style={{ textAlign: isAr ? 'right' : 'left' }}>
              {t('propertyDetail.loginToViewLocation')}
            </Text>
            <Text
              className="text-primary text-[12px] font-bold mt-1 uppercase"
              style={{ letterSpacing: 0.4, textAlign: isAr ? 'right' : 'left' }}>
              {t('propertyDetail.loginToView')}
            </Text>
          </View>
          <Ionicons name={isAr ? 'chevron-back' : 'chevron-forward'} size={18} color="#a8abae" />
        </Pressable>
      </View>
    );
  }

  const onOpen = () => Linking.openURL(buildMapsUrl(listing));

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.location')} />

      <Pressable
        onPress={onOpen}
        className="bg-cream border border-line rounded-xl p-3.5 flex-row items-center gap-3 active:bg-primary-50">
        <View className="w-10 h-10 rounded-lg bg-primary items-center justify-center">
          <LocationIcon size={18} color="#ffffff" />
        </View>
        <View className="flex-1">
          {address ? (
            <Text className="text-secondary text-[15px] font-bold" numberOfLines={2}>
              {address}
            </Text>
          ) : null}
          <Text className="text-text text-[13px] mt-0.5" numberOfLines={1}>
            {[neighborhood, city, country].filter(Boolean).join(' · ')}
          </Text>
          <Text
            className="text-primary text-[12px] font-bold mt-1 uppercase"
            style={{ letterSpacing: 0.4 }}>
            {t('propertyDetail.viewLargerMap')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#a8abae" />
      </Pressable>
    </View>
  );
}
