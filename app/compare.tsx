import { Ionicons } from '@expo/vector-icons';
import { useQueries } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCompare } from '@/apis/hooks';
import { listingAPI, type ExtendedListing } from '@/apis/listing';
import { localizeCity } from '@/constants/cities';
import { getCurrencySymbol } from '@/constants/currencies';
import { localizeListingStatus } from '@/constants/listing-status';
import { localizeAmenity } from '@/constants/amenities';
import { localizePropertyType } from '@/constants/property-types';
import { getSizeUnitLabel } from '@/constants/size-units';

const LABEL_WIDTH = 104;

export default function CompareScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isAr = isRTL;
  const router = useRouter();
  const { items, count, remove, clear } = useCompare();

  // Enrich each snapshot with the full listing (amenities/floor/furnished/…),
  // sharing the same cache key as the detail screen. Falls back to the snapshot.
  const results = useQueries({
    queries: items.map((it) => ({
      queryKey: ['listing', it._id],
      queryFn: () => listingAPI.getById(it._id),
      staleTime: 60 * 1000,
    })),
  });
  const rows: ExtendedListing[] = items.map((it, i) => ({
    ...(it as ExtendedListing),
    ...((results[i]?.data ?? {}) as ExtendedListing),
  }));

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const yes = isAr ? 'نعم' : 'Yes';
  const no = isAr ? 'لا' : 'No';

  // ---- value getters (null/empty cells render a muted dash) ----
  const get = {
    type: (p: ExtendedListing) =>
      localizePropertyType(p.propertyType, i18n.language) ?? p.propertyType ?? null,
    status: (p: ExtendedListing) =>
      localizeListingStatus(p.status, i18n.language) ?? p.status ?? null,
    price: (p: ExtendedListing) => {
      if (p.propertyPrice == null) return null;
      const sym = getCurrencySymbol((p.currency || 'USD').toUpperCase());
      return `${sym}${Number(p.propertyPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    },
    bedrooms: (p: ExtendedListing) =>
      p.bedrooms != null && Number(p.bedrooms) > 0 ? String(p.bedrooms) : null,
    bathrooms: (p: ExtendedListing) =>
      p.bathrooms != null && Number(p.bathrooms) > 0 ? String(p.bathrooms) : null,
    size: (p: ExtendedListing) =>
      p.size ? `${p.size} ${getSizeUnitLabel(p.sizeUnit, isAr)}` : null,
    floor: (p: ExtendedListing) => (p.floor != null ? String(p.floor) : null),
    yearBuilt: (p: ExtendedListing) => (p.yearBuilt ? String(p.yearBuilt) : null),
    furnished: (p: ExtendedListing) => (p.furnished == null ? null : p.furnished ? yes : no),
    garages: (p: ExtendedListing) =>
      p.garages ? (p.garageSize ? String(p.garageSize) : yes) : null,
    city: (p: ExtendedListing) => localizeCity(p.city ?? p.state ?? '', i18n.language) || null,
    neighborhood: (p: ExtendedListing) =>
      (isAr && p.neighborhood_ar) || p.neighborhood || null,
  };

  const specRows: { key: string; label: string; getter: (p: ExtendedListing) => string | null }[] = [
    { key: 'propertyType', label: t('compare.propertyType'), getter: get.type },
    { key: 'status', label: t('compare.status'), getter: get.status },
    { key: 'bedrooms', label: t('compare.bedrooms'), getter: get.bedrooms },
    { key: 'bathrooms', label: t('compare.bathrooms'), getter: get.bathrooms },
    { key: 'size', label: t('compare.size'), getter: get.size },
    { key: 'floor', label: t('compare.floor'), getter: get.floor },
    { key: 'yearBuilt', label: t('compare.yearBuilt'), getter: get.yearBuilt },
    { key: 'furnished', label: t('compare.furnished'), getter: get.furnished },
    { key: 'garages', label: t('compare.garages'), getter: get.garages },
  ];
  const locationRows = [
    { key: 'city', label: t('compare.city'), getter: get.city },
    { key: 'neighborhood', label: t('compare.neighborhood'), getter: get.neighborhood },
  ];

  // Union of all amenities present across the compared listings.
  const allAmenities = Array.from(
    new Set(rows.flatMap((p) => p.amenities ?? []))
  );

  // Only render a spec/location row if at least one listing has a value.
  const visibleSpecRows = specRows.filter((r) => rows.some((p) => r.getter(p)));
  const visibleLocationRows = locationRows.filter((r) => rows.some((p) => r.getter(p)));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: rowDir, alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-cream">
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#1f2937" />
        </Pressable>
        <Text
          className="flex-1 text-secondary text-[17px] font-extrabold tracking-tight"
          numberOfLines={1}
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('compare.compare')}
        </Text>
        {count > 0 ? (
          <Pressable onPress={clear} hitSlop={6} className="active:opacity-60">
            <Text className="text-danger text-[13px] font-bold">{t('compare.clearAll')}</Text>
          </Pressable>
        ) : null}
      </View>

      {count === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 rounded-full bg-cream items-center justify-center mb-4">
            <Ionicons name="git-compare" size={30} color="#f1913d" />
          </View>
          <Text className="text-secondary text-[17px] font-extrabold text-center">
            {t('compare.emptyTitle')}
          </Text>
          <Text className="text-text text-[13px] text-center mt-2 leading-[20px]">
            {t('compare.emptyText')}
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/property-list' as never)}
            className="bg-primary px-5 py-2.5 rounded-full mt-5 active:opacity-90">
            <Text className="text-white text-[14px] font-bold">{t('compare.browseListings')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Header row — listing cards */}
          <View style={{ flexDirection: rowDir, alignItems: 'stretch' }} className="px-3 pt-3">
            <View style={{ width: LABEL_WIDTH }} />
            {rows.map((p) => (
              <View key={p._id} style={{ flex: 1, paddingHorizontal: 4 }}>
                <View className="bg-white border border-line rounded-2xl overflow-hidden">
                  <View style={{ width: '100%', aspectRatio: 1 }}>
                    {p.images?.[0]?.url ? (
                      <Image
                        source={{ uri: p.images[0].url }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={150}
                      />
                    ) : (
                      <View className="w-full h-full bg-cream items-center justify-center">
                        <Ionicons name="image-outline" size={22} color="#a8abae" />
                      </View>
                    )}
                    <Pressable
                      onPress={() => remove(p._id)}
                      hitSlop={6}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 items-center justify-center active:opacity-80">
                      <Ionicons name="close" size={15} color="#ffffff" />
                    </Pressable>
                  </View>
                  <View className="px-2 py-2">
                    <Text
                      className="text-secondary text-[13px] font-extrabold text-center"
                      numberOfLines={1}>
                      {get.price(p) ?? t('compare.priceOnRequest')}
                    </Text>
                    <Text className="text-primary text-[11px] font-bold text-center mt-0.5" numberOfLines={1}>
                      {get.type(p) ?? '—'}
                    </Text>
                    <Pressable
                      onPress={() => router.push(`/property/${p._id}` as never)}
                      className="mt-1.5 bg-cream rounded-full py-1 active:opacity-80">
                      <Text className="text-primary text-[11px] font-bold text-center">
                        {t('compare.viewDetails')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Specifications */}
          {visibleSpecRows.length > 0 ? (
            <SectionBar label={t('compare.sectionSpecs')} isRTL={isRTL} />
          ) : null}
          {visibleSpecRows.map((r, idx) => (
            <CompareRow
              key={r.key}
              label={r.label}
              rowDir={rowDir}
              isRTL={isRTL}
              zebra={idx % 2 === 0}
              values={rows.map((p) => r.getter(p))}
            />
          ))}

          {/* Location */}
          {visibleLocationRows.length > 0 ? (
            <SectionBar label={t('compare.sectionLocation')} isRTL={isRTL} />
          ) : null}
          {visibleLocationRows.map((r, idx) => (
            <CompareRow
              key={r.key}
              label={r.label}
              rowDir={rowDir}
              isRTL={isRTL}
              zebra={idx % 2 === 0}
              values={rows.map((p) => r.getter(p))}
            />
          ))}

          {/* Amenities */}
          {allAmenities.length > 0 ? (
            <SectionBar label={t('compare.sectionAmenities')} isRTL={isRTL} />
          ) : null}
          {allAmenities.map((amenity, idx) => (
            <CompareRow
              key={amenity}
              label={localizeAmenity(amenity, i18n.language) ?? amenity}
              rowDir={rowDir}
              isRTL={isRTL}
              zebra={idx % 2 === 0}
              values={rows.map((p) => ((p.amenities ?? []).includes(amenity) ? '✓' : null))}
              checkmarks
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionBar({ label, isRTL }: { label: string; isRTL: boolean }) {
  return (
    <View className="px-4 pt-5 pb-2 bg-white">
      <Text
        className="text-secondary text-[13px] font-extrabold tracking-wide"
        style={{ textAlign: isRTL ? 'right' : 'left' }}>
        {label}
      </Text>
    </View>
  );
}

function CompareRow({
  label,
  values,
  rowDir,
  isRTL,
  zebra,
  checkmarks,
}: {
  label: string;
  values: (string | null)[];
  rowDir: 'row' | 'row-reverse';
  isRTL: boolean;
  zebra: boolean;
  checkmarks?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: rowDir, alignItems: 'stretch', backgroundColor: zebra ? '#faf7f3' : '#ffffff' }}>
      <View style={{ width: LABEL_WIDTH, paddingHorizontal: 16, paddingVertical: 11, justifyContent: 'center' }}>
        <Text
          className="text-note text-[12px] font-semibold"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {label}
        </Text>
      </View>
      {values.map((v, i) => (
        <View
          key={i}
          style={{ flex: 1, paddingHorizontal: 6, paddingVertical: 11, justifyContent: 'center', alignItems: 'center' }}>
          {v == null ? (
            <Text className="text-note text-[14px]">—</Text>
          ) : checkmarks ? (
            <Ionicons name="checkmark-circle" size={18} color="#06a788" />
          ) : (
            <Text className="text-secondary text-[13px] font-semibold text-center" numberOfLines={2}>
              {v}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
