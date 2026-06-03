import { Ionicons } from '@expo/vector-icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PropertyCard } from '@/components/property-card';
import { ListingSkeletonGrid } from '@/components/skeletons/listing-skeleton';
import { localizeCity } from '@/constants/cities';
import { searchListingsPaginated, type Listing } from '@/lib/api';

const SPOT_CITIES = ['Damascus', 'Latakia', 'Tartous', 'Homs', 'Hama'];

/**
 * Holiday Homes landing — daily-rent villas, farms & chalets across Syria
 * (mirrors the web villas-farms-daily-rent-syria landing). No city lock.
 */
export default function HolidayHomesScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['listings', 'holiday-homes', 'landing'],
    // Mirrors the web villas-farms-daily-rent-syria landing: ALL daily rentals
    // across Syria (villas/farms/chalets/holiday homes), no city or type lock.
    queryFn: () =>
      searchListingsPaginated({ status: 'rent', rentType: 'daily', limit: 30, sort: 'newest' }),
    placeholderData: keepPreviousData,
  });

  const listings: Listing[] = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-2 bg-white"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-cream">
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#1f2937" />
        </Pressable>
        <Text
          className="flex-1 text-secondary text-[17px] font-extrabold tracking-tight"
          numberOfLines={1}
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('home.holidayHomesTitle')}
        </Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item, i) => item._id || `${i}`}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: '#ffffff' }}
        CellRendererComponent={({ children, ...rest }) => (
          <View {...rest} className="px-10 bg-white">
            {children}
          </View>
        )}
        ListHeaderComponent={
          <View className="px-5 pt-1 pb-4">
            <LinearGradient
              colors={['#ff8c42', '#f1913d', '#e06c2a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}>
              <View
                className="bg-white/20 rounded-full px-3 py-1"
                style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text className="text-white text-[11px] font-bold">{t('home.summerEyebrow')}</Text>
              </View>
              <Text
                className="text-white text-[24px] font-extrabold mt-3"
                style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.5 }}>
                {t('home.holidayHomesTitle')}
                {total > 0 ? (
                  <Text className="text-white/80 text-[18px] font-bold"> ({total})</Text>
                ) : null}
              </Text>
              <Text
                className="text-white/90 text-[14px] font-medium mt-1.5"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('home.summerSubhead')}
              </Text>
              <View
                className="flex-row flex-wrap gap-2 mt-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                {SPOT_CITIES.map((c) => (
                  <View key={c} className="bg-white/20 rounded-full px-2.5 py-1">
                    <Text className="text-white text-[11px] font-semibold">
                      {localizeCity(c, i18n.language)}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pt-1 bg-white">
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
