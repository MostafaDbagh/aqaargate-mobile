import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Hero } from '@/components/hero';
import { HomeHeader } from '@/components/home-header';
import { PropertyCard } from '@/components/property-card';
import { CategoriesSection } from '@/components/sections/categories-section';
import { CitiesSection } from '@/components/sections/cities-section';
import { HolidayHomesSection } from '@/components/sections/holiday-homes-section';
import { SectionHeader } from '@/components/sections/section-header';
import { SocialMediaBar } from '@/components/sections/social-media-bar';
import { SummerCta } from '@/components/sections/summer-cta';
import { ListingSkeletonGrid } from '@/components/skeletons/listing-skeleton';
import { searchListings, type Listing, type SearchParams } from '@/lib/api';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [params, setParams] = useState<SearchParams>({ limit: 21, sort: 'newest' });

  const {
    data: listings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['listings', 'search', params],
    queryFn: () => searchListings(params),
  });

  const updateFilter = (patch: Partial<SearchParams>) => {
    setParams((prev) => {
      const next: SearchParams = { limit: 21, sort: 'newest', ...prev, ...patch };
      (Object.keys(next) as (keyof SearchParams)[]).forEach((k) => {
        const v = next[k];
        if (v === '' || v === undefined || (Array.isArray(v) && v.length === 0)) {
          delete next[k];
        }
      });
      return next;
    });
  };

  const handleHeroSearch = ({ keyword, status }: { keyword: string; status: string }) => {
    // A real keyword search opens the dedicated, status-agnostic results screen
    // (mirrors the web /search). A bare status pill just filters the home list.
    if (keyword) {
      router.push({ pathname: '/search', params: { keyword } });
      return;
    }
    updateFilter({ status: (status as SearchParams['status']) || '' });
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={['top']} className="bg-brand">
        <HomeHeader />
      </SafeAreaView>
      <FlatList
        data={listings as Listing[]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 40, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <View className="gap-6">
            <Hero
              value={params}
              onSearch={handleHeroSearch}
              onApplyFilters={updateFilter}
            />

            <CategoriesSection
              activeName={params.propertyType}
              onSelect={(name) => updateFilter({ propertyType: name })}
            />

            <CitiesSection
              onSelect={(city) => {
                if (!city) return;
                router.push({ pathname: '/(tabs)/property-list', params: { city } });
              }}
            />

            <View className="pb-2">
              <SectionHeader
                title={t('properties.title')}
                subtitle={t('properties.subtitle')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pt-2">
              <ListingSkeletonGrid count={4} />
            </View>
          ) : isError ? (
            <View className="py-16 items-center px-5">
              <Text className="text-text mb-3">{t('properties.error')}</Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2.5 rounded-full">
                <Text className="text-white font-semibold">{t('properties.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center">
              <Text className="text-note">{t('properties.empty')}</Text>
            </View>
          )
        }
        ListFooterComponent={
          <View className="gap-6 pt-6">
            <HolidayHomesSection />
            <SummerCta />
            <SocialMediaBar />
          </View>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#f1913d"
          />
        }
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-8">
            {children}
          </View>
        )}
      />
    </View>
  );
}
