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

// Frozen label column + zebra value area tints (kept subtle / on-brand warm).
const LABEL_COL_BG = '#f7f3ef';
const ZEBRA_BG = '#fbf8f4';

const cardShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

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

  // numeric extractors power the "standout" highlight (largest = most rooms/space).
  const num = {
    bedrooms: (p: ExtendedListing) => (Number(p.bedrooms) > 0 ? Number(p.bedrooms) : null),
    bathrooms: (p: ExtendedListing) => (Number(p.bathrooms) > 0 ? Number(p.bathrooms) : null),
    size: (p: ExtendedListing) => (Number(p.size) > 0 ? Number(p.size) : null),
  };

  type Row = {
    key: string;
    label: string;
    getter: (p: ExtendedListing) => string | null;
    numeric?: (p: ExtendedListing) => number | null;
  };

  const specRows: Row[] = [
    { key: 'propertyType', label: t('compare.propertyType'), getter: get.type },
    { key: 'status', label: t('compare.status'), getter: get.status },
    { key: 'bedrooms', label: t('compare.bedrooms'), getter: get.bedrooms, numeric: num.bedrooms },
    { key: 'bathrooms', label: t('compare.bathrooms'), getter: get.bathrooms, numeric: num.bathrooms },
    { key: 'size', label: t('compare.size'), getter: get.size, numeric: num.size },
    { key: 'floor', label: t('compare.floor'), getter: get.floor },
    { key: 'yearBuilt', label: t('compare.yearBuilt'), getter: get.yearBuilt },
    { key: 'furnished', label: t('compare.furnished'), getter: get.furnished },
    { key: 'garages', label: t('compare.garages'), getter: get.garages },
  ];
  const locationRows: Row[] = [
    { key: 'city', label: t('compare.city'), getter: get.city },
    { key: 'neighborhood', label: t('compare.neighborhood'), getter: get.neighborhood },
  ];

  // Union of all amenities present across the compared listings.
  const allAmenities = Array.from(new Set(rows.flatMap((p) => p.amenities ?? [])));

  // Only render a spec/location row if at least one listing has a value.
  const visibleSpecRows = specRows.filter((r) => rows.some((p) => r.getter(p)));
  const visibleLocationRows = locationRows.filter((r) => rows.some((p) => r.getter(p)));

  // Index of the single largest numeric value in a row (-1 = none / tie / all equal).
  const bestIndex = (r: Row): number => {
    if (!r.numeric) return -1;
    const present = rows
      .map((p, i) => ({ n: r.numeric!(p), i }))
      .filter((x): x is { n: number; i: number } => x.n != null);
    if (present.length < 2) return -1;
    if (new Set(present.map((x) => x.n)).size < 2) return -1; // all the same
    const max = Math.max(...present.map((x) => x.n));
    const winners = present.filter((x) => x.n === max);
    return winners.length === 1 ? winners[0].i : -1;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: rowDir, alignItems: 'center', gap: 10 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-cream">
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#1f2937" />
        </Pressable>
        <View style={{ flex: 1, flexDirection: rowDir, alignItems: 'center', gap: 8 }}>
          <Text
            className="text-secondary text-[18px] font-extrabold tracking-tight"
            numberOfLines={1}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('compare.compare')}
          </Text>
          {count > 0 ? (
            <View className="px-2 py-[2px] rounded-full bg-primary-soft">
              <Text className="text-primary text-[11px] font-extrabold">{count}</Text>
            </View>
          ) : null}
        </View>
        {count > 0 ? (
          <Pressable
            onPress={clear}
            hitSlop={6}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-danger/10 active:opacity-70"
            style={{ flexDirection: rowDir }}>
            <Ionicons name="trash-outline" size={13} color="#f2695c" />
            <Text className="text-danger text-[12px] font-bold">{t('compare.clearAll')}</Text>
          </Pressable>
        ) : null}
      </View>

      {count === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary-softer items-center justify-center mb-5">
            <View className="w-14 h-14 rounded-full bg-primary-soft items-center justify-center">
              <Ionicons name="git-compare" size={28} color="#f1913d" />
            </View>
          </View>
          <Text className="text-secondary text-[18px] font-extrabold text-center">
            {t('compare.emptyTitle')}
          </Text>
          <Text className="text-text text-[13px] text-center mt-2 leading-[20px]">
            {t('compare.emptyText')}
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/property-list' as never)}
            style={cardShadow}
            className="bg-primary px-6 py-3 rounded-full mt-6 active:opacity-90">
            <Text className="text-white text-[14px] font-bold">{t('compare.browseListings')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 44 }} showsVerticalScrollIndicator={false}>
          {/* Header row — listing cards */}
          <View style={{ flexDirection: rowDir, alignItems: 'stretch' }} className="px-3 pt-4">
            <View style={{ width: LABEL_WIDTH }} />
            {rows.map((p) => (
              <View key={p._id} style={{ flex: 1, paddingHorizontal: 5 }}>
                <View style={cardShadow} className="rounded-3xl bg-white">
                  <View className="rounded-3xl overflow-hidden bg-white border border-line">
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

                      {/* Status badge — frosted pill, start side */}
                      {get.status(p) ? (
                        <View
                          className="absolute top-2 px-2.5 py-1 rounded-full bg-white/95"
                          style={isAr ? { right: 8 } : { left: 8 }}>
                          <Text className="text-secondary text-[10px] font-extrabold" numberOfLines={1}>
                            {get.status(p)}
                          </Text>
                        </View>
                      ) : null}

                      {/* Remove — end side */}
                      <Pressable
                        onPress={() => remove(p._id)}
                        hitSlop={6}
                        className="absolute top-2 w-7 h-7 rounded-full bg-black/55 items-center justify-center active:opacity-80"
                        style={isAr ? { left: 8 } : { right: 8 }}>
                        <Ionicons name="close" size={15} color="#ffffff" />
                      </Pressable>
                    </View>

                    <View className="px-2.5 pt-2.5 pb-2.5">
                      <Text
                        className="text-secondary text-[15px] font-extrabold text-center"
                        numberOfLines={1}
                        style={{ letterSpacing: -0.3 }}>
                        {get.price(p) ?? t('compare.priceOnRequest')}
                      </Text>
                      <View className="items-center mt-1.5">
                        <View className="px-2.5 py-[3px] rounded-full bg-primary-softer">
                          <Text className="text-primary text-[10px] font-extrabold" numberOfLines={1}>
                            {get.type(p) ?? '—'}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => router.push(`/property/${p._id}` as never)}
                        className="mt-2.5 bg-primary-soft rounded-full py-1.5 active:opacity-80"
                        style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                        <Text className="text-primary text-[11px] font-extrabold text-center">
                          {t('compare.viewDetails')}
                        </Text>
                        <Ionicons
                          name={isRTL ? 'chevron-back' : 'chevron-forward'}
                          size={12}
                          color="#f1913d"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Comparison table — one elevated card */}
          <View style={cardShadow} className="mx-3 mt-5 rounded-3xl bg-white">
            <View className="rounded-3xl overflow-hidden">
              {/* Specifications */}
              {visibleSpecRows.length > 0 ? (
                <SectionBar label={t('compare.sectionSpecs')} icon="construct-outline" isRTL={isRTL} rowDir={rowDir} first />
              ) : null}
              {visibleSpecRows.map((r, idx) => (
                <CompareRow
                  key={r.key}
                  label={r.label}
                  rowDir={rowDir}
                  isRTL={isRTL}
                  zebra={idx % 2 === 1}
                  highlightIndex={bestIndex(r)}
                  values={rows.map((p) => r.getter(p))}
                />
              ))}

              {/* Location */}
              {visibleLocationRows.length > 0 ? (
                <SectionBar label={t('compare.sectionLocation')} icon="location-outline" isRTL={isRTL} rowDir={rowDir} />
              ) : null}
              {visibleLocationRows.map((r, idx) => (
                <CompareRow
                  key={r.key}
                  label={r.label}
                  rowDir={rowDir}
                  isRTL={isRTL}
                  zebra={idx % 2 === 1}
                  highlightIndex={-1}
                  values={rows.map((p) => r.getter(p))}
                />
              ))}

              {/* Amenities */}
              {allAmenities.length > 0 ? (
                <SectionBar label={t('compare.sectionAmenities')} icon="sparkles-outline" isRTL={isRTL} rowDir={rowDir} />
              ) : null}
              {allAmenities.map((amenity, idx) => (
                <CompareRow
                  key={amenity}
                  label={localizeAmenity(amenity, i18n.language) ?? amenity}
                  rowDir={rowDir}
                  isRTL={isRTL}
                  zebra={idx % 2 === 1}
                  highlightIndex={-1}
                  values={rows.map((p) => ((p.amenities ?? []).includes(amenity) ? '✓' : null))}
                  checkmarks
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionBar({
  label,
  icon,
  isRTL,
  rowDir,
  first,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isRTL: boolean;
  rowDir: 'row' | 'row-reverse';
  first?: boolean;
}) {
  return (
    <View
      className="px-4 py-3 bg-cream border-b border-line"
      style={{ flexDirection: rowDir, alignItems: 'center', gap: 8, borderTopWidth: first ? 0 : 1, borderTopColor: '#ececec' }}>
      <View className="w-7 h-7 rounded-full bg-primary-soft items-center justify-center">
        <Ionicons name={icon} size={15} color="#f1913d" />
      </View>
      <Text
        className="text-secondary text-[12px] font-extrabold"
        style={{
          textAlign: isRTL ? 'right' : 'left',
          letterSpacing: isRTL ? 0 : 0.6,
          textTransform: isRTL ? 'none' : 'uppercase',
        }}>
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
  highlightIndex,
}: {
  label: string;
  values: (string | null)[];
  rowDir: 'row' | 'row-reverse';
  isRTL: boolean;
  zebra: boolean;
  checkmarks?: boolean;
  highlightIndex: number;
}) {
  return (
    <View style={{ flexDirection: rowDir, alignItems: 'stretch' }}>
      {/* Frozen label column */}
      <View
        style={{
          width: LABEL_WIDTH,
          paddingHorizontal: 16,
          paddingVertical: 13,
          justifyContent: 'center',
          backgroundColor: LABEL_COL_BG,
        }}>
        <Text
          className="text-note2 text-[12px] font-bold"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {label}
        </Text>
      </View>

      {/* Value cells (zebra-striped) */}
      <View style={{ flex: 1, flexDirection: rowDir, backgroundColor: zebra ? ZEBRA_BG : '#ffffff' }}>
        {values.map((v, i) => {
          const isBest = i === highlightIndex && v != null;
          return (
            <View
              key={i}
              style={{ flex: 1, paddingHorizontal: 6, paddingVertical: 13, justifyContent: 'center', alignItems: 'center' }}>
              {v == null ? (
                <Text className="text-note text-[15px]">—</Text>
              ) : checkmarks ? (
                <Ionicons name="checkmark-circle" size={20} color="#06a788" />
              ) : isBest ? (
                <View className="px-2.5 py-1 rounded-full bg-primary-soft">
                  <Text className="text-primary text-[13px] font-extrabold text-center" numberOfLines={2}>
                    {v}
                  </Text>
                </View>
              ) : (
                <Text className="text-secondary text-[13px] font-semibold text-center" numberOfLines={2}>
                  {v}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
