import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import type { ExtendedListing } from '@/apis/listing';
import { searchListings, type Listing } from '@/lib/api';

import { SectionTitle } from './specs-grid';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SYP: 'ل.س',
  AED: 'د.إ',
  SAR: 'ر.س',
};

const formatPrice = (price?: number, currency?: string) => {
  if (!price) return '—';
  const code = (currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? '$';
  return `${symbol}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export function SimilarListings({ current }: { current: ExtendedListing }) {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: results = [] } = useQuery({
    queryKey: ['listings', 'similar', current.city, current.propertyType, current.status, current._id],
    queryFn: () =>
      searchListings({
        limit: 8,
        sort: 'newest',
        city: current.city,
        propertyType: current.propertyType,
        status: current.status,
      }),
    enabled: !!current._id,
    staleTime: 60 * 1000,
  });

  const similar = (results as Listing[]).filter((l) => l._id !== current._id).slice(0, 6);
  if (similar.length === 0) return null;

  return (
    <View className="mt-6 mb-4">
      <View className="px-5">
        <SectionTitle title={t('propertyDetail.similarListings')} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
        {similar.map((l) => (
          <Pressable
            key={l._id}
            onPress={() => router.push(`/property/${l._id}` as never)}
            className="w-[210px] bg-white border border-line rounded-xl overflow-hidden active:opacity-80">
            {l.images?.[0]?.url ? (
              <Image
                source={{ uri: l.images[0].url }}
                style={{ width: '100%', height: 130 }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View className="w-full h-[130px] bg-cream" />
            )}
            <View className="p-2.5">
              <Text
                className="text-secondary text-[15px] font-extrabold"
                style={{ letterSpacing: -0.3 }}>
                {formatPrice(l.propertyPrice, l.currency)}
              </Text>
              <Text className="text-text text-[12px] font-semibold mt-0.5" numberOfLines={1}>
                {l.propertyType ?? '—'}
              </Text>
              <Text className="text-note text-[10px] mt-0.5" numberOfLines={1}>
                {l.city ?? l.state ?? ''}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
