import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Project } from '@/apis/project';
import { useProjects } from '@/apis/hooks';

const STATUS_KEYS = ['all', 'off-plan', 'ready'] as const;
type StatusKey = (typeof STATUS_KEYS)[number];

const formatPriceRange = (
  start?: number,
  end?: number,
  currency?: string
): string | null => {
  if (!start && !end) return null;
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${n.toLocaleString()} ${currency ?? ''}`.trim();
    }
  };
  if (start && end && start !== end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start ?? end ?? 0);
};

export default function ProjectsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusKey, setStatusKey] = useState<StatusKey>('all');

  const query = useMemo(
    () => ({
      limit: 50,
      ...(statusKey !== 'all' ? { status: statusKey } : {}),
    }),
    [statusKey]
  );

  const { data, isLoading, isError, refetch, isRefetching } = useProjects(query);
  const projects = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((p) => {
      return (
        p.name?.toLowerCase().includes(term) ||
        p.name_ar?.toLowerCase().includes(term) ||
        p.developer?.name?.toLowerCase().includes(term) ||
        p.city?.toLowerCase().includes(term)
      );
    });
  }, [projects, searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusKey('all');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-cream">
      {/* Header */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityLabel={t('settings.back')}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-cream">
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color="#2c2e33"
          />
        </Pressable>
        <Text
          className="flex-1 text-secondary text-[18px] font-extrabold"
          style={{ textAlign: 'center' }}>
          {t('projectsScreen.title')}
        </Text>
        <View className="w-9 h-9" />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            isRTL={isRTL}
            onPress={() => router.push(`/projects/${item.slug ?? item._id}`)}
            priceText={formatPriceRange(item.startingPrice, item.endingPrice, item.currency)}
            statusLabel={
              item.status === 'ready'
                ? t('projectsScreen.statusReady')
                : t('projectsScreen.statusOffPlan')
            }
            featuredLabel={t('projectsScreen.featured')}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <View className="pt-4 pb-2">
            <Text
              className="px-5 text-text text-[12px] mb-3"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('projectsScreen.subtitle')}
            </Text>

            {/* Search */}
            <View className="px-5">
              <View className="flex-row items-center bg-white rounded-xl px-3 py-2 border border-line">
                <Ionicons name="search" size={18} color="#a8abae" />
                <TextInput
                  className="flex-1 ml-2 text-secondary text-[14px]"
                  placeholder={t('projectsScreen.searchPlaceholder')}
                  placeholderTextColor="#a8abae"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  returnKeyType="search"
                />
                {searchTerm ? (
                  <Pressable onPress={() => setSearchTerm('')} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#a8abae" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Status chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              className="mt-3">
              {STATUS_KEYS.map((key) => {
                const active = statusKey === key;
                const label =
                  key === 'all'
                    ? t('projectsScreen.statusAll')
                    : key === 'ready'
                      ? t('projectsScreen.statusReady')
                      : t('projectsScreen.statusOffPlan');
                return (
                  <Pressable
                    key={key}
                    onPress={() => setStatusKey(key)}
                    className={`px-3 py-1.5 rounded-full border ${
                      active ? 'bg-primary border-primary' : 'bg-white border-line'
                    }`}>
                    <Text
                      className={`text-[12px] font-semibold ${
                        active ? 'text-white' : 'text-text'
                      }`}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text
              className="px-5 mt-3 text-note text-[12px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('projectsScreen.count', {
                shown: filtered.length,
                total: projects.length,
              })}
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center">
              <ActivityIndicator size="large" color="#f1913d" />
              <Text className="text-text mt-3">{t('projectsScreen.loading')}</Text>
            </View>
          ) : isError ? (
            <View className="py-16 items-center px-5">
              <Ionicons name="alert-circle-outline" size={42} color="#f2695c" />
              <Text className="text-secondary text-[15px] font-bold mt-2">
                {t('projectsScreen.errorTitle')}
              </Text>
              <Text className="text-text text-center mt-1">
                {t('projectsScreen.errorMessage')}
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2 rounded-full mt-4">
                <Text className="text-white font-semibold">
                  {t('projectsScreen.retry')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center px-5">
              <Ionicons name="search" size={42} color="#a8abae" />
              <Text className="text-secondary text-[15px] font-bold mt-2">
                {t('projectsScreen.emptyTitle')}
              </Text>
              <Text className="text-text text-center mt-1">
                {t('projectsScreen.emptyMessage')}
              </Text>
              <Pressable
                onPress={resetFilters}
                className="bg-primary px-5 py-2 rounded-full mt-4">
                <Text className="text-white font-semibold">
                  {t('projectsScreen.resetFilters')}
                </Text>
              </Pressable>
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
          <View {...rest} className="px-5">
            {children}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function ProjectCard({
  project,
  isRTL,
  onPress,
  priceText,
  statusLabel,
  featuredLabel,
}: {
  project: Project;
  isRTL: boolean;
  onPress: () => void;
  priceText: string | null;
  statusLabel: string;
  featuredLabel: string;
}) {
  const name = isRTL ? project.name_ar || project.name : project.name;
  const developer = isRTL
    ? project.developer?.name_ar || project.developer?.name
    : project.developer?.name;
  const cityLine = [project.neighborhood, project.city].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      className="mt-3 bg-white rounded-2xl border border-line overflow-hidden active:opacity-90">
      {project.coverImage ? (
        <Image
          source={{ uri: project.coverImage }}
          style={{ width: '100%', height: 160 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View className="w-full h-[160px] bg-cream items-center justify-center">
          <Ionicons name="business-outline" size={42} color="#a8abae" />
        </View>
      )}

      <View className="p-4">
        <View
          className="flex-row items-center gap-2 mb-1"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <View
            className={`px-2 py-0.5 rounded-full ${
              project.status === 'ready' ? 'bg-[#10b9811A]' : 'bg-[#f1913d1A]'
            }`}>
            <Text
              className={`text-[11px] font-bold ${
                project.status === 'ready' ? 'text-[#10b981]' : 'text-primary'
              }`}>
              {statusLabel}
            </Text>
          </View>
          {project.isFeatured ? (
            <View className="px-2 py-0.5 rounded-full bg-[#a855f71A] flex-row items-center gap-1">
              <Ionicons name="star" size={10} color="#a855f7" />
              <Text className="text-[11px] font-bold text-[#a855f7]">
                {featuredLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          className="text-secondary text-[16px] font-extrabold"
          numberOfLines={1}
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {name}
        </Text>

        {developer ? (
          <Text
            className="text-text text-[12px] mt-0.5"
            numberOfLines={1}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {developer}
          </Text>
        ) : null}

        {cityLine ? (
          <View
            className="flex-row items-center gap-1 mt-2"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Ionicons name="location-outline" size={14} color="#5c5e61" />
            <Text className="text-text text-[12px]" numberOfLines={1}>
              {cityLine}
            </Text>
          </View>
        ) : null}

        {priceText ? (
          <Text
            className="text-primary text-[15px] font-extrabold mt-2"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {priceText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
