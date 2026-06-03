import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';

import { PropertyCard } from '@/components/property-card';
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
      {/* Header row: title + count, and a "View all" link */}
      <View
        className="px-5 flex-row items-center justify-between mb-5"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <View style={{ flexShrink: 1 }}>
          <Text
            className="text-secondary text-[18px] font-extrabold"
            style={{ letterSpacing: -0.3, textAlign: isRTL ? 'right' : 'left' }}>
            {t('home.holidayHomesTitle')}
            {total > 0 ? <Text className="text-note text-[15px] font-bold"> ({total})</Text> : null}
          </Text>
          <Text
            className="text-note text-[12px] mt-0.5"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('home.holidayHomesSubtitle')}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/holiday-homes' as never)}
          className="flex-row items-center gap-1 active:opacity-70"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Text className="text-primary text-[13px] font-bold">{t('home.viewAll')}</Text>
          <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={14} color="#f1913d" />
        </Pressable>
      </View>

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
