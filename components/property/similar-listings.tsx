import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { PropertyCard } from '@/components/property-card';
import type { ExtendedListing } from '@/apis/listing';
import { searchListings, type Listing } from '@/lib/api';

import { SectionTitle } from './specs-grid';

export function SimilarListings({ current }: { current: ExtendedListing }) {
  const { t } = useTranslation();

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
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {similar.map((l) => (
          <View key={l._id} style={{ width: 240 }}>
            <PropertyCard listing={l} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
