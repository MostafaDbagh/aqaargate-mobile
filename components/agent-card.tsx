import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import { LocationIcon } from '@/components/icons/svg-icons';
import { useAgent } from '@/apis/hooks';
import type { Agent } from '@/apis/agent';
import {
  formatAgentLocationParts,
  pickAgentCompany,
} from '@/lib/agent-location';

type Props = {
  agent: Agent;
  onEmail?: (email: string) => void;
};

function useResolvedCompany(agent: Agent, isRTL: boolean): string {
  const listValue = pickAgentCompany(agent, isRTL);
  const id = agent._id || agent.id;
  const needsFetch = !listValue && !!id;
  const detailQuery = useAgent(needsFetch ? id : undefined);
  if (listValue) return listValue;
  const detail = (detailQuery?.data as Agent | null) || null;
  return detail ? pickAgentCompany(detail, isRTL) : '';
}

export function AgentCard({ agent, onEmail }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const company = useResolvedCompany(agent, isRTL);

  const locationParts = formatAgentLocationParts(agent.location, t);
  const openDetails = () => router.push(`/agent/${agent._id}`);

  const handleCall = () => {
    if (agent.phone) Linking.openURL(`tel:${agent.phone.replace(/\s+/g, '')}`);
  };
  const handleEmail = () => {
    if (agent.email) {
      if (onEmail) onEmail(agent.email);
      else Linking.openURL(`mailto:${agent.email}`);
    }
  };

  return (
    <View
      className="bg-white rounded-2xl overflow-hidden mb-4 border border-line"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}>
      {/* AVATAR + verified badge — tap to open details */}
      <Pressable onPress={openDetails} className="active:opacity-90">
        <View className="relative items-center pt-5">
          <View
            className="rounded-full overflow-hidden border-2 border-primary-100"
            style={{ width: 110, height: 110 }}>
            {agent.avatar ? (
              <Image
                source={{ uri: agent.avatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={150}
              />
            ) : (
              <View className="w-full h-full bg-cream items-center justify-center">
                <Ionicons name="person" size={48} color="#a8abae" />
              </View>
            )}
          </View>

          {agent.isTrueAgent ? (
            <View
              className="absolute flex-row items-center gap-1 px-2 py-1 rounded-full"
              style={{
                top: 8,
                right: 24,
                backgroundColor: '#06a788',
              }}>
              <Ionicons name="checkmark-circle" size={12} color="#ffffff" />
              <Text className="text-white text-[10px] font-bold">
                {t('agentsScreen.verified')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* HEADER CONTENT */}
        <View className="px-4 pt-3 items-center">
          <Text
            className="text-secondary text-[16px] font-extrabold tracking-tight text-center"
            numberOfLines={1}>
            {agent.fullName || t('agentsScreen.agentName')}
          </Text>

          <Text
            className="text-text text-[13px] mt-0.5 text-center"
            numberOfLines={1}>
            {agent.position || agent.job || t('agentsScreen.realEstateAgent')}
          </Text>

          {company ? (
            <View className="flex-row items-center gap-1 mt-1">
              <Ionicons name="business-outline" size={13} color="#5c5e61" />
              <Text className="text-text text-[12px] font-medium" numberOfLines={1}>
                {company}
              </Text>
            </View>
          ) : null}

          {locationParts.length > 0 ? (
            <View className="flex-row flex-wrap items-center justify-center gap-1.5 mt-2">
              {locationParts.map((label, index) => (
                <View
                  key={`${label}-${index}`}
                  className="flex-row items-center gap-1 bg-primary-50 px-2 py-1 rounded-full">
                  <LocationIcon size={11} color="#f1913d" />
                  <Text className="text-primary text-[11px] font-semibold">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>

      {/* CONTACT ACTIONS */}
      <View className="px-4 pt-3 pb-4 items-center">
        {(agent.phone || agent.email) ? (
          <View className="flex-row gap-2 mt-4 w-full">
            {agent.email ? (
              <Pressable
                onPress={handleEmail}
                className="flex-1 flex-row items-center justify-center gap-2 bg-white border border-line rounded-lg py-2 active:bg-cream">
                <Ionicons name="mail-outline" size={15} color="#5c5e61" />
                <Text className="text-text text-[12px] font-semibold" numberOfLines={1}>
                  {t('agentsScreen.email')}
                </Text>
              </Pressable>
            ) : null}
            {agent.phone ? (
              <Pressable
                onPress={handleCall}
                className="flex-1 flex-row items-center justify-center gap-2 bg-white border border-primary rounded-lg py-2 active:bg-primary-50">
                <Ionicons name="call-outline" size={15} color="#f1913d" />
                <Text className="text-primary text-[12px] font-semibold">
                  {t('agentsScreen.call')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
