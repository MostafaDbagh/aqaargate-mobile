import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';

import { PropertyCard } from '@/components/property-card';
import { SectionHeader } from '@/components/sections/section-header';
import { searchListingsPaginated } from '@/lib/api';

const CARD_WIDTH = 310;

/** Home carousel of Holiday Home listings with a live count + "View all" link. */
export function HolidayHomesSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: ['listings', 'holiday-homes', 'home'],
    queryFn: () => searchListingsPaginated({ propertyType: 'Holiday Home', limit: 10, sort: 'newest' }),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.data ?? [];
  const total = data?.pagination.total ?? 0;

  // Hide the section entirely when there's nothing to show.
  if (!isLoading && items.length === 0) return null;

  return (
    <View className="py-2">
      {/* Title + live count, with a "View all" link — unified via SectionHeader. */}
      <SectionHeader
        title={t('home.holidayHomesTitle')}
        subtitle={t('home.holidayHomesSubtitle')}
        count={total}
        action={
          <Pressable
            onPress={() => router.push('/holiday-homes' as never)}
            className="flex-row items-center gap-1 active:opacity-70"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text className="text-primary text-[13px] font-bold">{t('home.viewAll')}</Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color="#f1913d" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View className="px-5">
          <View className="bg-line rounded-2xl" style={{ height: 220, width: CARD_WIDTH }} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          horizontal
          inverted={isRTL}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <PropertyCard listing={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}
