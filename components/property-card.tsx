import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { Listing } from '@/lib/api';

const formatPrice = (price?: number, currency?: string) => {
  if (!price) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price.toLocaleString()} ${currency ?? ''}`.trim();
  }
};

export function PropertyCard({ listing }: { listing: Listing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const cover = listing.images?.[0]?.url;
  const address = (isAr && listing.address_ar) || listing.address || listing.city || '';

  return (
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-4 border border-gray-100">
      <View className="relative">
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="w-full h-[200px] bg-gray-200" />
        )}
        {listing.status ? (
          <View className="absolute top-3 left-3 bg-brand-accent px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">{listing.status}</Text>
          </View>
        ) : null}
        {listing.isFeatured ? (
          <View className="absolute top-3 right-3 bg-yellow-400 px-3 py-1 rounded-full">
            <Text className="text-brand text-xs font-bold">★</Text>
          </View>
        ) : null}
      </View>

      <View className="p-4">
        <Text className="text-brand text-lg font-bold" numberOfLines={1}>
          {formatPrice(listing.propertyPrice, listing.currency)}
        </Text>
        <Text className="text-gray-700 mt-1" numberOfLines={1}>
          {listing.propertyType || '—'}
        </Text>
        {address ? (
          <View className="flex-row items-center mt-1 gap-1">
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-sm flex-1" numberOfLines={1}>
              {address}
            </Text>
          </View>
        ) : null}

        <View className="flex-row mt-3 gap-4">
          {listing.bedrooms != null ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm">
                {listing.bedrooms} {t('properties.beds')}
              </Text>
            </View>
          ) : null}
          {listing.bathrooms != null ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="water-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm">
                {listing.bathrooms} {t('properties.baths')}
              </Text>
            </View>
          ) : null}
          {listing.size ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="resize-outline" size={16} color="#6b7280" />
              <Text className="text-gray-600 text-sm">
                {listing.size} {listing.sizeUnit || 'sqm'}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
