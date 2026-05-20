import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountIcon } from '@/components/account-icon';
import { CrownIcon } from '@/components/icons/svg-icons';
import { PropertyCard } from '@/components/property-card';
import { SettingsIcon } from '@/components/settings-icon';
import { searchListings, type Listing } from '@/lib/api';

const HERO_IMAGE =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920';
const VIP_PHONE = '+963980184112';
const VIP_EMAIL = 'contact@aqaargate.com';

export default function VipScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const rowDir = isRTL ? 'row-reverse' : 'row';
  const textAlign = isRTL ? 'right' : 'left';

  const {
    data: listings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['listings', 'search', { isVip: 'true', limit: 12, sort: 'newest' }],
    queryFn: () => searchListings({ isVip: 'true', limit: 12, sort: 'newest' }),
  });

  const hasListings = (listings as Listing[]).length > 0;

  const onCall = () => Linking.openURL(`tel:${VIP_PHONE}`);
  const onEmail = () => Linking.openURL(`mailto:${VIP_EMAIL}?subject=VIP%20Inquiry`);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={listings as Listing[]}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PropertyCard listing={item} />}
        contentContainerStyle={{ paddingBottom: 24, backgroundColor: '#ffffff' }}
        ListHeaderComponent={
          <View className="bg-white">
            {/* HERO */}
            <View className="relative overflow-hidden" style={{ height: 460 }}>
              <Image
                source={{ uri: HERO_IMAGE }}
                style={{ position: 'absolute', inset: 0 }}
                contentFit="cover"
                transition={200}
              />
              <LinearGradient
                colors={['rgba(8,10,16,0.92)', 'rgba(15,20,30,0.78)', 'rgba(20,24,32,0.65)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', inset: 0 }}
              />
              {/* Bottom golden blob */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  bottom: -120,
                  right: -100,
                  width: 320,
                  height: 320,
                  borderRadius: 320,
                  backgroundColor: 'rgba(197, 155, 109, 0.35)',
                }}
              />

              <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View
                  className="flex-row items-center justify-end gap-2 px-5 pt-1"
                  pointerEvents="box-none">
                  <SettingsIcon variant="dark" />
                  <AccountIcon variant="dark" />
                </View>
                <View className="flex-1 justify-center px-6">
                  {/* Badge */}
                  <View
                    className="flex-row items-center gap-2 mb-5"
                    style={{ flexDirection: rowDir }}>
                    <CrownIcon size={32} color="#f1913d" />
                    <Text
                      className="text-primary text-[16px] font-extrabold tracking-[1.5px]"
                      style={{ textAlign }}>
                      {t('vipPage.heroBadge')}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text
                    className="text-white text-[30px] font-extrabold leading-[36px] tracking-tight"
                    style={{
                      textAlign,
                      textShadowColor: 'rgba(0,0,0,0.35)',
                      textShadowOffset: { width: 0, height: 4 },
                      textShadowRadius: 18,
                    }}>
                    {t('vipPage.heroTitle')}
                  </Text>

                  {/* Golden accent line */}
                  <View
                    className="bg-primary mt-4 mb-4"
                    style={{
                      width: 72,
                      height: 3,
                      borderRadius: 3,
                      alignSelf: isRTL ? 'flex-end' : 'flex-start',
                    }}
                  />

                  {/* Subtitle */}
                  <Text
                    className="text-white/90 text-[15px] leading-[22px] mb-7"
                    style={{ textAlign }}>
                    {t('vipPage.heroSubtitle')}
                  </Text>

                  {/* CTA button */}
                  <Pressable
                    onPress={() => {
                      // Scrolling within FlatList header is non-trivial; the listings
                      // section is right below this header so the CTA mostly serves
                      // as a visual affordance. No-op is acceptable.
                    }}
                    disabled={!hasListings}
                    style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start', opacity: hasListings ? 1 : 0.6 }}>
                    <LinearGradient
                      colors={['#f1913d', '#e67e22']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 28,
                        paddingVertical: 14,
                        flexDirection: rowDir,
                        alignItems: 'center',
                        gap: 8,
                      }}>
                      <Text className="text-white text-[15px] font-bold tracking-wide">
                        {t('vipPage.heroCta')}
                      </Text>
                      <Ionicons
                        name={isRTL ? 'arrow-back' : 'arrow-forward'}
                        size={16}
                        color="#ffffff"
                      />
                    </LinearGradient>
                  </Pressable>
                </View>
              </SafeAreaView>
            </View>

            {/* WHY CHOOSE */}
            <View className="px-5 pt-10 pb-8 bg-white">
              <View className="items-center mb-6">
                <Text
                  className="text-heading text-[24px] font-bold leading-[30px] text-center mb-2">
                  {t('vipPage.whyTitle')}
                </Text>
                <Text className="text-text text-[15px] leading-[22px] text-center">
                  {t('vipPage.whySubtitle')}
                </Text>
              </View>

              <FeatureCard
                icon={<Ionicons name="time-outline" size={28} color="#f1913d" />}
                title={t('vipPage.whyTimeTitle')}
                isRTL={isRTL}>
                <Text
                  className="text-text text-[14px] leading-[22px] text-center"
                  style={{ textAlign: 'center' }}>
                  {t('vipPage.whyTimeDesc')}
                </Text>
              </FeatureCard>

              <FeatureCard
                icon={<Ionicons name="star-outline" size={28} color="#f1913d" />}
                title={t('vipPage.whatWeOffer')}
                isRTL={isRTL}>
                <View className="w-full">
                  {[
                    t('vipPage.offerItem1'),
                    t('vipPage.offerItem2'),
                    t('vipPage.offerItem3'),
                    t('vipPage.offerItem4'),
                  ].map((item, idx) => (
                    <View
                      key={idx}
                      className="flex-row items-start gap-2 mb-2.5"
                      style={{ flexDirection: rowDir }}>
                      <Text className="text-primary text-[15px] font-bold leading-[22px]">
                        ✓
                      </Text>
                      <Text
                        className="text-text text-[14px] leading-[22px] flex-1"
                        style={{ textAlign }}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </FeatureCard>

              <FeatureCard
                icon={<CrownIcon size={28} color="#f1913d" />}
                title={t('vipPage.whyPremiumTitle')}
                isRTL={isRTL}>
                <Text
                  className="text-text text-[14px] leading-[22px] text-center"
                  style={{ textAlign: 'center' }}>
                  {t('vipPage.whyPremiumDesc')}
                </Text>
              </FeatureCard>
            </View>

            {/* LISTINGS SECTION HEADER */}
            <View className="px-5 pt-8 pb-4 bg-cream">
              <Text className="text-heading text-[22px] font-bold text-center mb-2">
                {t('vipPage.listingsTitle')}
              </Text>
              <Text className="text-text text-[14px] leading-[20px] text-center">
                {t('vipPage.listingsSubtitle')}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="py-16 items-center bg-cream">
              <ActivityIndicator size="large" color="#f1913d" />
            </View>
          ) : isError ? (
            <View className="py-16 items-center bg-cream px-5">
              <Text className="text-text mb-3">{t('properties.error')}</Text>
              <Pressable
                onPress={() => refetch()}
                className="bg-primary px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">{t('properties.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-12 items-center bg-cream px-5">
              <Text className="text-note text-center">{t('vipPage.noListings')}</Text>
            </View>
          )
        }
        ListFooterComponent={
          <View>
            {/* CTA */}
            <View className="px-4 pt-10 pb-6 bg-cream">
              <View
                className="rounded-2xl overflow-hidden"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.18,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 6,
                }}>
                <LinearGradient
                  colors={['#000000', '#374151']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ padding: 28, alignItems: 'center' }}>
                  <CrownIcon size={48} color="#f1913d" />
                  <Text className="text-white text-[22px] font-bold mt-4 text-center leading-[28px]">
                    {t('vipPage.ctaTitle')}
                  </Text>
                  <Text className="text-white/85 text-[14px] mt-3 text-center leading-[22px]">
                    {t('vipPage.ctaSubtitle')}
                  </Text>

                  <View className="w-full mt-6 gap-3">
                    <Pressable
                      onPress={onCall}
                      className="bg-black border-2 border-black rounded-lg active:opacity-90"
                      style={{ paddingVertical: 14 }}>
                      <View
                        className="flex-row items-center justify-center gap-2"
                        style={{ flexDirection: rowDir }}>
                        <Ionicons name="call" size={18} color="#ffffff" />
                        <Text className="text-white text-[15px] font-semibold">
                          {t('vipPage.ctaConsultation')}
                        </Text>
                      </View>
                    </Pressable>

                    <Pressable
                      onPress={onEmail}
                      className="border-2 border-white rounded-lg active:opacity-80"
                      style={{ paddingVertical: 14 }}>
                      <View
                        className="flex-row items-center justify-center gap-2"
                        style={{ flexDirection: rowDir }}>
                        <Ionicons name="mail" size={18} color="#ffffff" />
                        <Text className="text-white text-[15px] font-semibold">
                          {t('vipPage.ctaContact')}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* SEO FOOTER */}
            <View className="px-6 py-8 bg-white border-t border-line">
              <Text className="text-text text-[12px] leading-[20px] text-center">
                {t('vipPage.seoFooter')}
              </Text>
            </View>
          </View>
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
          <View {...rest} className="px-5 bg-cream">
            {children}
          </View>
        )}
      />
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  children,
  isRTL,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  isRTL: boolean;
}) {
  return (
    <View
      className="bg-white rounded-2xl border-2 mb-4 px-5 py-6 items-center"
      style={{
        borderColor: 'rgba(241, 145, 61, 0.2)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}>
      <View
        className="w-14 h-14 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: 'rgba(241, 145, 61, 0.12)' }}>
        {icon}
      </View>
      <Text className="text-heading text-[18px] font-bold mb-3 text-center">{title}</Text>
      {children}
    </View>
  );
}
