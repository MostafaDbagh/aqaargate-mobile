import { Ionicons } from '@expo/vector-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PropertyCard } from '@/components/property-card';
import { ListingSkeletonGrid } from '@/components/skeletons/listing-skeleton';
import { aiSearchListings, searchListingsPaginated, type Listing } from '@/lib/api';

function pickString(v: unknown): string {
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : '';
  return typeof v === 'string' ? v : '';
}

/**
 * Dedicated keyword / AI search results — status-agnostic (mirrors the web
 * /search page, which intentionally has no sale/rent lock).
 */
export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const params = useLocalSearchParams();
  const keyword = pickString(params.keyword).trim();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['listings', 'search-results', keyword],
    // AI natural-language search first (mirrors web hero); fall back to plain
    // keyword search if the AI endpoint errors or returns nothing.
    queryFn: async () => {
      if (!keyword) return searchListingsPaginated({ limit: 30, sort: 'newest' });
      try {
        const ai = await aiSearchListings(keyword, { limit: 30 });
        if (ai.data.length > 0) return ai;
      } catch {
        // ignore and fall back
      }
      return searchListingsPaginated({ keyword, limit: 30, sort: 'newest' });
    },
    placeholderData: keepPreviousData,
  });

  const listings: Listing[] = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-cream">
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#1f2937" />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-secondary text-[17px] font-extrabold tracking-tight"
            numberOfLines={1}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('properties.searchResults')}
          </Text>
          {keyword ? (
            <Text
              className="text-note text-[12px]"
              numberOfLines={1}
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              “{keyword}” · {t('propertyList.results', { count: total })}
            </Text>
          ) : null}
        </View>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item, i) => item._id || `${i}`}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32, backgroundColor: '#ffffff' }}
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-10 bg-white">
            {children}
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pt-2 bg-white">
              <ListingSkeletonGrid count={4} />
            </View>
          ) : isError ? (
            <View className="py-16 items-center bg-white px-5">
              <Text className="text-text mb-3">{t('properties.error')}</Text>
              <Pressable onPress={() => refetch()} className="bg-primary px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">{t('properties.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center bg-white px-5">
              <Text className="text-note">{t('properties.empty')}</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#f1913d" />
        }
      />
    </SafeAreaView>
  );
}
