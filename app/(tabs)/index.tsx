import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Hero } from '@/components/hero';
import { HomeHeader } from '@/components/home-header';
import { PropertyCard } from '@/components/property-card';
import { CategoriesSection } from '@/components/sections/categories-section';
import { CitiesSection } from '@/components/sections/cities-section';
import { SectionHeader } from '@/components/sections/section-header';
import { searchListings, type Listing, type SearchParams } from '@/lib/api';

export default function HomeScreen() {
  const { t } = useTranslation();
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
      // Strip empty values so they don't get serialized as `?key=`
      (Object.keys(next) as (keyof SearchParams)[]).forEach((k) => {
        if (next[k] === '' || next[k] === undefined) delete next[k];
      });
      return next;
    });
  };

  const handleHeroSearch = ({ keyword, status }: { keyword: string; status: string }) => {
    updateFilter({ keyword: keyword || '', status: (status as SearchParams['status']) || '' });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <FlatList
        data={listings as Listing[]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <View>
            <HomeHeader />
            <Hero onSearch={handleHeroSearch} />

            <CategoriesSection
              activeName={params.propertyType}
              onSelect={(name) => updateFilter({ propertyType: name })}
            />

            <CitiesSection
              activeCity={(params as SearchParams & { city?: string }).city}
              onSelect={(city) => updateFilter({ city } as Partial<SearchParams>)}
            />

            <View className="bg-white pt-8 pb-3">
              <SectionHeader
                title={t('properties.title')}
                subtitle={t('properties.subtitle')}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center bg-white">
              <ActivityIndicator size="large" color="#f1913d" />
            </View>
          ) : isError ? (
            <View className="py-16 items-center bg-white px-5">
              <Text className="text-text mb-3">{t('properties.error')}</Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">{t('properties.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center bg-white">
              <Text className="text-note">{t('properties.empty')}</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#f1913d" />
        }
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-5 bg-white">
            {children}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
