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

  const handleSearch = ({ keyword, status }: { keyword: string; status: string }) => {
    setParams({
      limit: 21,
      sort: 'newest',
      ...(keyword ? { keyword } : {}),
      ...(status ? { status } : {}),
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <FlatList
        data={listings as Listing[]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: '#f8fafc' }}
        ListHeaderComponent={
          <View>
            <HomeHeader />
            <Hero onSearch={handleSearch} />
            <View className="px-5 pt-6 pb-3 bg-slate-50">
              <Text className="text-brand text-xl font-bold">
                {t('properties.title')}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {t('properties.subtitle')}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center bg-slate-50">
              <ActivityIndicator size="large" color="#e94545" />
            </View>
          ) : isError ? (
            <View className="py-16 items-center bg-slate-50 px-5">
              <Text className="text-gray-600 mb-3">{t('properties.error')}</Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-brand-accent px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">{t('properties.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center bg-slate-50">
              <Text className="text-gray-500">{t('properties.empty')}</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#e94545" />
        }
        // Apply horizontal padding to each card row via wrapper
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-5 bg-slate-50">
            {children}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
