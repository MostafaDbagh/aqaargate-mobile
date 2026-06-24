import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountIcon } from '@/components/account-icon';
import { PropertyCard } from '@/components/property-card';
import { SectionHeader } from '@/components/sections/section-header';
import { SettingsIcon } from '@/components/settings-icon';
import { ListingSkeletonGrid } from '@/components/skeletons/listing-skeleton';
import { searchListings, type Listing } from '@/lib/api';

export default function RentScreen() {
  const { t } = useTranslation();

  const {
    data: listings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['listings', 'search', { status: 'rent', limit: 30, sort: 'newest' }],
    queryFn: () => searchListings({ status: 'rent', limit: 30, sort: 'newest' }),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-end gap-2 px-5 pt-2 pb-1 bg-white">
        <SettingsIcon variant="light" />
        <AccountIcon variant="light" />
      </View>
      <FlatList
        data={listings as Listing[]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <View className="pt-6 pb-3 bg-white">
            <SectionHeader
              title={t('rentScreen.title')}
              subtitle={t('rentScreen.subtitle')}
            />
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pt-2 bg-white">
              <ListingSkeletonGrid count={4} />
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#f1913d"
          />
        }
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-6 bg-white">
            {children}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
