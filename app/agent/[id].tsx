import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Agent } from '@/apis/agent';
import { useAgent, useListingsByAgent } from '@/apis/hooks';
import { PropertyCard } from '@/components/property-card';
import {
  formatAgentLocationParts,
  pickAgentCompany,
} from '@/lib/agent-location';

const SITE = 'https://www.aqaargate.com';

function pickLocalized<K extends keyof Agent>(
  agent: Agent | null | undefined,
  field: K,
  arabicField: keyof Agent,
  isRTL: boolean
): string {
  if (!agent) return '';
  if (isRTL && agent[arabicField]) return String(agent[arabicField]);
  const v = agent[field];
  return v ? String(v) : '';
}

export default function AgentDetailsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showMore, setShowMore] = useState(false);

  const { data: agent, isLoading, isError, refetch } = useAgent(id);
  const { data: listings = [] } = useListingsByAgent(id, { limit: 12, sort: 'newest' });

  const fullName =
    pickLocalized(agent, 'fullName', 'username_ar', isRTL) ||
    agent?.username ||
    agent?.fullName ||
    '';
  const position =
    pickLocalized(agent, 'position', 'position_ar', isRTL) ||
    pickLocalized(agent, 'job', 'job_ar', isRTL) ||
    t('agentsScreen.realEstateAgent');
  const company = pickAgentCompany(agent ?? null, isRTL);
  const description = pickLocalized(agent, 'description', 'description_ar', isRTL);
  const location =
    pickLocalized(agent, 'location', 'location_ar', isRTL) || agent?.location || '';
  const officeAddress = pickLocalized(agent, 'officeAddress', 'officeAddress_ar', isRTL);
  const locationParts = formatAgentLocationParts(location, t);

  const memberSince = agent?.createdAt
    ? new Date(agent.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'long',
      })
    : '';

  const onCall = () => {
    if (agent?.phone) Linking.openURL(`tel:${agent.phone.replace(/\s+/g, '')}`);
  };
  const onEmail = () => {
    if (agent?.email) Linking.openURL(`mailto:${agent.email}`);
  };
  const onWhatsApp = () => {
    const wa = (agent?.whatsapp || agent?.phone || '').replace(/[^\d+]/g, '');
    if (wa) Linking.openURL(`https://wa.me/${wa.replace('+', '')}`);
  };
  const onShare = async () => {
    if (!agent) return;
    const url = `${SITE}/${isRTL ? 'ar' : 'en'}/agents-details/${agent._id}`;
    await Share.share({ message: `${fullName || t('agentsScreen.agentName')} — ${url}`, url });
  };
  const onOpenLink = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('agentsScreen.back', 'Back')}
            className="w-10 h-10 rounded-full bg-white/95 items-center justify-center active:bg-white">
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#2c2e33" />
          </Pressable>
          <Pressable
            onPress={onShare}
            accessibilityLabel="Share"
            className="w-10 h-10 rounded-full bg-white/95 items-center justify-center active:bg-white">
            <Ionicons name="share-outline" size={20} color="#2c2e33" />
          </Pressable>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f1913d" />
          <Text className="text-text mt-3">{t('agentsScreen.loading')}</Text>
        </View>
      ) : isError || !agent ? (
        <View className="flex-1 items-center justify-center px-5">
          <Ionicons name="alert-circle-outline" size={42} color="#f2695c" />
          <Text className="text-secondary text-[15px] font-bold mt-2">
            {t('agentsScreen.errorTitle')}
          </Text>
          <Text className="text-text text-center mt-1">
            {t('agentsScreen.errorMessage')}
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-primary px-5 py-2.5 rounded-full mt-4">
            <Text className="text-white font-semibold">{t('agentsScreen.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}>
          {/* HERO */}
          <View className="pt-16 pb-6 px-5 bg-cream items-center">
            <View
              className="rounded-full overflow-hidden border-4 border-white"
              style={{
                width: 132,
                height: 132,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }}>
              {agent.avatar ? (
                <Image
                  source={{ uri: agent.avatar }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={150}
                />
              ) : (
                <View className="w-full h-full bg-line items-center justify-center">
                  <Ionicons name="person" size={60} color="#a8abae" />
                </View>
              )}
            </View>

            <Text className="text-secondary text-[22px] font-extrabold tracking-tight mt-4 text-center">
              {fullName || t('agentsScreen.agentName')}
            </Text>
            <Text className="text-text text-[14px] mt-1 text-center">
              {position}
              {company ? (
                <>
                  <Text className="text-text"> {isRTL ? 'في' : 'at'} </Text>
                  <Text className="text-primary font-semibold">{company}</Text>
                </>
              ) : null}
            </Text>

            {agent.isTrueAgent ? (
              <View
                className="flex-row items-center gap-1 px-3 py-1 rounded-full mt-3"
                style={{ backgroundColor: '#06a788' }}>
                <Ionicons name="checkmark-circle" size={14} color="#ffffff" />
                <Text className="text-white text-[12px] font-bold">
                  {t('agentsScreen.verified')}
                </Text>
              </View>
            ) : null}

            {locationParts.length > 0 ? (
              <View className="flex-row flex-wrap items-center justify-center gap-1.5 mt-3">
                {locationParts.map((label, index) => (
                  <View
                    key={`${label}-${index}`}
                    className="flex-row items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-line">
                    <Ionicons name="location-outline" size={12} color="#f1913d" />
                    <Text className="text-secondary text-[12px] font-semibold">
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* PRIMARY ACTIONS */}
          {(agent.phone || agent.email) ? (
            <View className="flex-row gap-2 px-5 -mt-4 mb-5">
              {agent.phone ? (
                <Pressable
                  onPress={onCall}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3 active:opacity-80"
                  style={{
                    shadowColor: '#f1913d',
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}>
                  <Ionicons name="call" size={16} color="#ffffff" />
                  <Text className="text-white text-[13px] font-bold">
                    {t('agentsScreen.call')}
                  </Text>
                </Pressable>
              ) : null}
              {agent.phone || agent.whatsapp ? (
                <Pressable
                  onPress={onWhatsApp}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3 active:opacity-80"
                  style={{ backgroundColor: '#25D366' }}>
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                  <Text className="text-white text-[13px] font-bold">WhatsApp</Text>
                </Pressable>
              ) : null}
              {agent.email ? (
                <Pressable
                  onPress={onEmail}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-white border border-primary rounded-xl py-3 active:bg-primary-50">
                  <Ionicons name="mail" size={16} color="#f1913d" />
                  <Text className="text-primary text-[13px] font-bold">
                    {t('agentsScreen.email')}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {/* ABOUT */}
          <View className="px-5 mb-5">
            <Text className="text-secondary text-[16px] font-extrabold mb-2">
              {fullName
                ? t('agentDetails.aboutAgent', { name: fullName })
                : t('agentDetails.aboutThisAgent')}
            </Text>
            <Text
              className="text-text text-[14px] leading-6"
              style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}>
              {description || t('agentDetails.defaultBio')}
            </Text>
          </View>

          {/* SHOW MORE — Details, contact, achievements */}
          {showMore ? (
            <View className="mx-5 mb-5 bg-cream rounded-2xl p-4 border border-line">
              <Text className="text-secondary text-[15px] font-extrabold mb-3">
                {t('agentDetails.professionalDetails')}
              </Text>
              <DetailRow label={t('agentDetails.position')} value={position} />
              {company ? (
                <DetailRow label={t('agentDetails.company')} value={company} />
              ) : null}
              {agent.officeNumber ? (
                <DetailRow
                  label={t('agentDetails.officePhone')}
                  value={agent.officeNumber}
                  ltrValue
                />
              ) : null}
              {officeAddress ? (
                <DetailRow label={t('agentDetails.officeAddress')} value={officeAddress} />
              ) : null}
              {memberSince ? (
                <DetailRow label={t('agentDetails.memberSince')} value={memberSince} />
              ) : null}

              {/* Achievements */}
              <View className="flex-row justify-around mt-4 pt-4 border-t border-line">
                <Stat number="5+" label={t('agentDetails.yearsExperience')} />
                <Stat number="98%" label={t('agentDetails.clientSatisfaction')} />
                <Stat number="24/7" label={t('agentDetails.availability')} />
              </View>

              {/* Social */}
              {(agent.facebook || agent.twitter || agent.linkedin || agent.instagram) ? (
                <View className="mt-4 pt-4 border-t border-line">
                  <Text className="text-secondary text-[13px] font-bold mb-2">
                    {t('agentDetails.followMe')}
                  </Text>
                  <View className="flex-row gap-2">
                    {agent.facebook ? (
                      <SocialIcon name="logo-facebook" onPress={() => onOpenLink(agent.facebook)} />
                    ) : null}
                    {agent.twitter ? (
                      <SocialIcon name="logo-twitter" onPress={() => onOpenLink(agent.twitter)} />
                    ) : null}
                    {agent.linkedin ? (
                      <SocialIcon name="logo-linkedin" onPress={() => onOpenLink(agent.linkedin)} />
                    ) : null}
                    {agent.instagram ? (
                      <SocialIcon name="logo-instagram" onPress={() => onOpenLink(agent.instagram)} />
                    ) : null}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          <Pressable
            onPress={() => setShowMore((v) => !v)}
            className="mx-5 mb-6 flex-row items-center justify-center gap-1.5 active:opacity-70">
            <Text className="text-primary text-[13px] font-bold">
              {showMore ? t('agentDetails.showLess') : t('agentDetails.showMore')}
            </Text>
            <Ionicons
              name={showMore ? 'chevron-up' : 'chevron-down'}
              size={16}
              color="#f1913d"
            />
          </Pressable>

          {/* LISTINGS */}
          {listings.length > 0 ? (
            <View>
              <View className="px-5 mb-3 flex-row items-center justify-between">
                <Text className="text-secondary text-[16px] font-extrabold">
                  {t('agentDetails.listingsByAgent')}
                </Text>
                <Text className="text-note text-[12px]">{listings.length}</Text>
              </View>
              <View className="px-5">
                {listings.map((listing) => (
                  <PropertyCard key={listing._id} listing={listing} />
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function DetailRow({
  label,
  value,
  ltrValue = false,
}: {
  label: string;
  value: string;
  ltrValue?: boolean;
}) {
  return (
    <View className="flex-row items-start justify-between gap-3 py-1.5">
      <Text className="text-text text-[13px] font-semibold flex-shrink-0">{label}</Text>
      <Text
        className="text-secondary text-[13px] font-medium flex-1 text-right"
        style={ltrValue ? { writingDirection: 'ltr' } : undefined}
        numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-primary text-[20px] font-extrabold">{number}</Text>
      <Text className="text-text text-[11px] mt-0.5 text-center">{label}</Text>
    </View>
  );
}

function SocialIcon({
  name,
  onPress,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-9 h-9 rounded-full bg-white border border-line items-center justify-center active:bg-primary-50">
      <Ionicons name={name} size={18} color="#f1913d" />
    </Pressable>
  );
}
