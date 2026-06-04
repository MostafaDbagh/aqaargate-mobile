import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAgents } from '@/apis/hooks';
import type { Agent } from '@/apis/agent';
import { AccountIcon } from '@/components/account-icon';
import { AgentCard } from '@/components/agent-card';
import { SectionHeader } from '@/components/sections/section-header';
import { SettingsIcon } from '@/components/settings-icon';
import { CardListSkeleton } from '@/components/skeletons/screen-skeletons';
import {
  AGENT_LOCATION_FILTER_KEYS,
  matchesAgentLocationFilter,
} from '@/lib/agent-location';

const LOCATION_KEYS = ['all', ...AGENT_LOCATION_FILTER_KEYS] as const;

export default function AgentsScreen() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationKey, setLocationKey] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const { data, isLoading, isError, refetch, isRefetching } = useAgents();
  // Memoize so the reference is stable across renders (a bare `data ?? []`
  // makes a fresh array each render, defeating the `filtered` useMemo below).
  const agents = useMemo(() => (data ?? []) as Agent[], [data]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return agents
      .filter((agent) => {
        const matchesSearch =
          !term ||
          agent.fullName?.toLowerCase().includes(term) ||
          agent.companyName?.toLowerCase().includes(term) ||
          agent.company?.toLowerCase().includes(term);
        const matchesLocation = matchesAgentLocationFilter(locationKey, agent.location);
        const matchesVerified = !verifiedOnly || agent.isTrueAgent === true;
        return matchesSearch && matchesLocation && matchesVerified;
      })
      .sort((a, b) => {
        const aTrue = a.isTrueAgent ? 1 : 0;
        const bTrue = b.isTrueAgent ? 1 : 0;
        return bTrue - aTrue;
      });
  }, [agents, searchTerm, locationKey, verifiedOnly]);

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setLocationKey('all');
    setVerifiedOnly(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="flex-row items-center justify-end gap-2 px-5 pt-2 pb-1 bg-white">
        <SettingsIcon variant="light" />
        <AccountIcon variant="light" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AgentCard agent={item} onEmail={handleEmail} />
        )}
        contentContainerStyle={{ paddingBottom: 32, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <View className="pt-6 pb-3 bg-white">
            <SectionHeader
              title={t('agentsScreen.title')}
              subtitle={t('agentsScreen.subtitle')}
            />

            {/* Search */}
            <View className="px-5 mt-3">
              <View className="flex-row items-center bg-cream rounded-xl px-3 py-2 border border-line">
                <Ionicons name="search" size={18} color="#a8abae" />
                <TextInput
                  className="flex-1 ml-2 text-secondary text-[14px]"
                  placeholder={t('agentsScreen.searchPlaceholder')}
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

            {/* Location chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
              className="mt-3">
              {LOCATION_KEYS.map((key) => {
                const active = locationKey === key;
                const label =
                  key === 'all'
                    ? t('agentsScreen.allLocation')
                    : t(`agentsScreen.cities.${key}`);
                return (
                  <Pressable
                    key={key}
                    onPress={() => setLocationKey(key)}
                    className={`px-3 py-1.5 rounded-full border ${
                      active
                        ? 'bg-primary border-primary'
                        : 'bg-white border-line'
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

            {/* Verified toggle */}
            <View className="px-5 mt-3 mb-2 flex-row items-center justify-between">
              <Pressable
                onPress={() => setVerifiedOnly((v) => !v)}
                className="flex-row items-center gap-2"
                hitSlop={6}>
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    verifiedOnly
                      ? 'bg-primary border-primary'
                      : 'border-note bg-white'
                  }`}>
                  {verifiedOnly ? (
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  ) : null}
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="shield-checkmark" size={14} color="#06a788" />
                  <Text className="text-secondary text-[13px] font-semibold">
                    {t('agentsScreen.verifiedOnly')}
                  </Text>
                </View>
              </Pressable>

              <Text className="text-note text-[12px]">
                {t('agentsScreen.count', {
                  shown: filtered.length,
                  total: agents.length,
                })}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pt-2 bg-white">
              <CardListSkeleton count={6} height={120} />
            </View>
          ) : isError ? (
            <View className="py-16 items-center bg-white px-5">
              <Ionicons name="alert-circle-outline" size={42} color="#f2695c" />
              <Text className="text-secondary text-[15px] font-bold mt-2">
                {t('agentsScreen.errorTitle')}
              </Text>
              <Text className="text-text text-center mt-1">
                {t('agentsScreen.errorMessage')}
              </Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2 rounded-full mt-4">
                <Text className="text-white font-semibold">
                  {t('agentsScreen.retry')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center bg-white px-5">
              <Ionicons name="search" size={42} color="#a8abae" />
              <Text className="text-secondary text-[15px] font-bold mt-2">
                {t('agentsScreen.emptyTitle')}
              </Text>
              <Text className="text-text text-center mt-1">
                {t('agentsScreen.emptyMessage')}
              </Text>
              <Pressable
                onPress={resetFilters}
                className="bg-primary px-5 py-2 rounded-full mt-4">
                <Text className="text-white font-semibold">
                  {t('agentsScreen.resetFilters')}
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
          <View {...rest} className="px-5 bg-white">
            {children}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
