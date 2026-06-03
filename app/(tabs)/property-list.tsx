import { Ionicons } from '@expo/vector-icons';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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

import { AccountIcon } from '@/components/account-icon';
import { FilterIcon } from '@/components/icons/svg-icons';
import { PropertyCard } from '@/components/property-card';
import { SettingsIcon } from '@/components/settings-icon';
import {
  EMPTY_FILTERS,
  PropertyFilterModal,
  type PropertyFiltersValue,
} from '@/components/property-filter-modal';
import { ListingSkeletonGrid } from '@/components/skeletons/listing-skeleton';
import { searchListingsPaginated, type Listing, type SearchParams } from '@/lib/api';

type Status = PropertyFiltersValue['status'];
type Sort = 'newest' | 'oldest';

const PAGE_SIZE = 16;
const MAX_VISIBLE_PAGES = 5;

function pickString(v: unknown): string {
  if (Array.isArray(v)) return typeof v[0] === 'string' ? v[0] : '';
  return typeof v === 'string' ? v : '';
}

function paramsToFilters(params: Record<string, unknown>): PropertyFiltersValue {
  const status = pickString(params.status).toLowerCase();
  return {
    status:
      status === 'sale' || status === 'rent' ? (status as Status) : '',
    propertyType: pickString(params.propertyType),
    city: pickString(params.city) || pickString(params.cities) || pickString(params.state),
    priceMin: pickString(params.priceMin),
    priceMax: pickString(params.priceMax),
    currency: pickString(params.currency),
    bedrooms: pickString(params.bedrooms),
    bathrooms: pickString(params.bathrooms),
  };
}

function filtersToSearchParams(
  filters: PropertyFiltersValue,
  sort: Sort
): SearchParams {
  const out: SearchParams = { limit: PAGE_SIZE, sort };
  if (filters.status) out.status = filters.status;
  if (filters.propertyType) out.propertyType = filters.propertyType;
  if (filters.city) out.city = filters.city;
  if (filters.priceMin) out.priceMin = filters.priceMin;
  if (filters.priceMax) out.priceMax = filters.priceMax;
  if (filters.currency) out.currency = filters.currency;
  if (filters.bedrooms) out.bedrooms = filters.bedrooms;
  if (filters.bathrooms) out.bathrooms = filters.bathrooms;
  return out;
}

function countActiveFilters(f: PropertyFiltersValue): number {
  let n = 0;
  (Object.keys(f) as (keyof PropertyFiltersValue)[]).forEach((k) => {
    if (f[k]) n += 1;
  });
  return n;
}

type PageItem = { kind: 'page'; page: number } | { kind: 'ellipsis'; key: string };

function buildPaginationItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 1) return [{ kind: 'page', page: 1 }];

  let start = Math.max(1, current - Math.floor(MAX_VISIBLE_PAGES / 2));
  let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
  if (end - start + 1 < MAX_VISIBLE_PAGES) {
    start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
  }

  const items: PageItem[] = [];
  if (start > 1) {
    items.push({ kind: 'page', page: 1 });
    if (start > 2) items.push({ kind: 'ellipsis', key: 'left' });
  }
  for (let i = start; i <= end; i++) items.push({ kind: 'page', page: i });
  if (end < totalPages) {
    if (end < totalPages - 1) items.push({ kind: 'ellipsis', key: 'right' });
    items.push({ kind: 'page', page: totalPages });
  }
  return items;
}

export default function PropertyListScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const urlParams = useLocalSearchParams();
  const listRef = useRef<FlatList<Listing>>(null);

  const initialSort = (pickString(urlParams.sort) as Sort) || 'newest';
  const [sort, setSort] = useState<Sort>(
    initialSort === 'oldest' ? 'oldest' : 'newest'
  );
  const [filters, setFilters] = useState<PropertyFiltersValue>(
    paramsToFilters(urlParams as Record<string, unknown>)
  );
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const p = parseInt(pickString(urlParams.page) || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const baseParams = useMemo(
    () => filtersToSearchParams(filters, sort),
    [filters, sort]
  );

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [baseParams]);

  const { data, isLoading, isError, refetch, isRefetching, isFetching } = useQuery({
    queryKey: ['listings', 'property-list', baseParams, currentPage],
    queryFn: () => searchListingsPaginated({ ...baseParams, page: currentPage }),
    placeholderData: keepPreviousData,
  });

  const listings: Listing[] = data?.data ?? [];
  const pagination = data?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const activeCount = countActiveFilters(filters);

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === currentPage) return;
    setCurrentPage(next);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onSelectStatus = (next: Status) => {
    setFilters((prev) => ({ ...prev, status: next }));
  };
  const onApplyFilters = (next: PropertyFiltersValue) => {
    setFilters(next);
    setFilterOpen(false);
  };

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        <View className="flex-1 px-1">
          <Text
            className="text-secondary text-[17px] font-extrabold tracking-tight"
            numberOfLines={1}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {filters.status === 'sale'
              ? t('properties.titleSaleOnly')
              : filters.status === 'rent'
                ? t('properties.titleRentOnly')
                : t('propertyList.title')}
          </Text>
          {total > 0 ? (
            <Text
              className="text-note text-[12px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('propertyList.results', { count: total })}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={() => setFilterOpen(true)}
          className="flex-row items-center gap-1.5 px-3 h-9 rounded-full border border-line bg-white active:bg-cream"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <FilterIcon size={15} color="#5c5e61" />
          <Text className="text-secondary text-[13px] font-semibold">
            {t('propertyList.filters')}
          </Text>
          {activeCount > 0 ? (
            <View className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-primary items-center justify-center">
              <Text className="text-white text-[11px] font-bold">{activeCount}</Text>
            </View>
          ) : null}
        </Pressable>
        <View className="flex-row items-center gap-2 ml-2">
          <SettingsIcon variant="light" />
          <AccountIcon variant="light" />
        </View>
      </View>

      {/* Segmented status + sort row */}
      <View
        className="px-4 pt-3 pb-2 bg-white"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
        <View
          className="flex-row p-1 rounded-full border border-line bg-white flex-1"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {(
            [
              { v: '' as const, l: t('propertyList.any') },
              { v: 'sale' as const, l: t('propertyList.buy') },
              { v: 'rent' as const, l: t('propertyList.rent') },
            ]
          ).map(({ v, l }) => {
            const active = filters.status === v;
            return (
              <Pressable
                key={v || 'any'}
                onPress={() => onSelectStatus(v)}
                className={`flex-1 py-1.5 rounded-full items-center ${
                  active ? 'bg-primary' : 'active:bg-cream'
                }`}>
                <Text
                  className={`text-[13px] font-bold ${
                    active ? 'text-white' : 'text-secondary'
                  }`}>
                  {l}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
          className="flex-row items-center gap-1.5 h-9 px-3 rounded-full border border-line bg-white active:bg-cream"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Ionicons name="swap-vertical" size={15} color="#5c5e61" />
          <Text className="text-secondary text-[13px] font-semibold">
            {sort === 'newest' ? t('propertyList.newest') : t('propertyList.oldest')}
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        ref={listRef}
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
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">
                  {t('properties.retry')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center bg-white px-5">
              <Text className="text-note">{t('properties.empty')}</Text>
              {activeCount > 0 ? (
                <Pressable
                  onPress={() => setFilters(EMPTY_FILTERS)}
                  className="mt-3 px-4 py-2 rounded-full border border-primary">
                  <Text className="text-primary font-semibold">
                    {t('propertyList.clearAll')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )
        }
        ListFooterComponent={
          listings.length === 0 ? null : (
            <View className="px-5 pt-2 pb-4 bg-white">
              <Text
                className="text-note text-[12px] mb-3"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('propertyList.showingResults', {
                  start: (currentPage - 1) * PAGE_SIZE + 1,
                  end: Math.min(currentPage * PAGE_SIZE, total),
                  total,
                })}
              </Text>
              <View
                className="flex-row items-center justify-center gap-1.5 flex-wrap"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <PageButton
                  disabled={currentPage <= 1 || isFetching}
                  onPress={() => goToPage(currentPage - 1)}>
                  <Ionicons
                    name={isRTL ? 'chevron-forward' : 'chevron-back'}
                    size={16}
                    color={currentPage <= 1 ? '#a8abae' : '#1f2937'}
                  />
                </PageButton>
                {paginationItems.map((item) =>
                  item.kind === 'ellipsis' ? (
                    <View
                      key={item.key}
                      className="w-9 h-9 items-center justify-center">
                      <Text className="text-note text-[13px]">…</Text>
                    </View>
                  ) : (
                    <PageButton
                      key={item.page}
                      active={item.page === currentPage}
                      disabled={isFetching && item.page !== currentPage}
                      onPress={() => goToPage(item.page)}>
                      <Text
                        className={`text-[13px] font-bold ${
                          item.page === currentPage ? 'text-white' : 'text-secondary'
                        }`}>
                        {item.page}
                      </Text>
                    </PageButton>
                  )
                )}
                <PageButton
                  disabled={currentPage >= totalPages || isFetching}
                  onPress={() => goToPage(currentPage + 1)}>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={16}
                    color={currentPage >= totalPages ? '#a8abae' : '#1f2937'}
                  />
                </PageButton>
              </View>
              {isFetching && !isRefetching ? (
                <View className="items-center pt-3">
                  <ActivityIndicator color="#f1913d" />
                </View>
              ) : null}
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
      />

      <PropertyFilterModal
        visible={filterOpen}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={onApplyFilters}
      />
    </SafeAreaView>
  );
}

function PageButton({
  children,
  active = false,
  disabled = false,
  onPress,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`min-w-9 h-9 px-2 rounded-lg border items-center justify-center ${
        active
          ? 'bg-primary border-primary'
          : disabled
            ? 'bg-white border-line opacity-50'
            : 'bg-white border-line active:bg-cream'
      }`}>
      {children}
    </Pressable>
  );
}
