import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { PropertyCard } from '@/components/property-card';
import type { ExtendedListing } from '@/apis/listing';
import { searchListings, type Listing, type SearchParams } from '@/lib/api';

import { SectionTitle } from './specs-grid';

export function SimilarListings({ current }: { current: ExtendedListing }) {
  const { t } = useTranslation();

  // The search endpoint expects the short status enum ('sale' / 'rent'), but a
  // listing's own status is a long/display value — normalize it (mirrors PropertyCard).
  const statusKey = (current.status ?? '').toLowerCase();
  const status: SearchParams['status'] = statusKey.includes('rent')
    ? 'rent'
    : statusKey.includes('sale')
      ? 'sale'
      : undefined;

  const { data: results = [] } = useQuery({
    queryKey: ['listings', 'similar', current.city, current.propertyType, status, current._id],
    queryFn: async () => {
      const base = { limit: 8, sort: 'newest' as const };
      const TARGET = 4;
      // Resilient fetch — a failing param combo returns [] instead of killing the chain.
      const safeSearch = async (p: SearchParams): Promise<Listing[]> => {
        try {
          const res = (await searchListings(p)) as Listing[];
          return res.filter((l) => l._id !== current._id);
        } catch {
          return [];
        }
      };

      // Tier 1 — same city + type + status (closest match).
      let list = await safeSearch({
        ...base,
        city: current.city,
        propertyType: current.propertyType,
        status,
      });
      if (list.length >= TARGET) return list;

      // Tier 2 — relax property type: same city + status.
      if (current.city) {
        const next = await safeSearch({ ...base, city: current.city, status });
        if (next.length > list.length) list = next;
        if (list.length >= TARGET) return list;
      }

      // Tier 3 — relax city: same status anywhere.
      if (status) {
        const next = await safeSearch({ ...base, status });
        if (next.length > list.length) list = next;
        if (list.length >= TARGET) return list;
      }

      // Tier 4 — newest overall, so the section is never needlessly empty.
      if (list.length === 0) list = await safeSearch(base);
      return list;
    },
    enabled: !!current._id,
    staleTime: 60 * 1000,
  });

  const similar = (results as Listing[]).slice(0, 6);
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
