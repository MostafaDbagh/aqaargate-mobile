import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { agentAPI } from '@/apis/agent';
import { useAuth } from '@/apis/hooks';
import { SOCIALS, SocialButton } from '@/components/sections/social-media-bar';
import { searchListingsPaginated } from '@/lib/api';
import { openLegal } from '@/lib/legal';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

// Soft lift shared by every card so rows read as distinct tappable surfaces.
const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const { signout } = useAuth();

  const totalQuery = useQuery({
    queryKey: ['stats', 'listings-total'],
    queryFn: () => searchListingsPaginated({ limit: 1 }),
    staleTime: 60_000,
  });
  const rentQuery = useQuery({
    queryKey: ['stats', 'listings-rent'],
    queryFn: () => searchListingsPaginated({ limit: 1, status: 'rent' }),
    staleTime: 60_000,
  });
  const saleQuery = useQuery({
    queryKey: ['stats', 'listings-sale'],
    queryFn: () => searchListingsPaginated({ limit: 1, status: 'sale' }),
    staleTime: 60_000,
  });
  const agentsQuery = useQuery({
    queryKey: ['stats', 'agents-total'],
    queryFn: () => agentAPI.getAgents(),
    staleTime: 5 * 60_000,
  });

  const total = totalQuery.data?.pagination.total;
  const rent = rentQuery.data?.pagination.total;
  const sale = saleQuery.data?.pagination.total;
  const agents = agentsQuery.data?.length;
  const statsLoading =
    totalQuery.isLoading || rentQuery.isLoading || saleQuery.isLoading || agentsQuery.isLoading;

  const setLang = (lng: 'en' | 'ar') => {
    if (i18n.language !== lng) i18n.changeLanguage(lng);
  };

  const confirmSignOut = () => {
    Alert.alert(t('profile.logout') ?? 'Sign out', '', [
      { text: t('settings.back'), style: 'cancel' },
      {
        text: t('settings.signOut'),
        style: 'destructive',
        onPress: () => signout.mutate(),
      },
    ]);
  };

  const appVersion =
    (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#f3f3f5]">
      {/* Header */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        <Text
          className="flex-1 text-secondary text-[18px] font-extrabold"
          style={{ textAlign: 'center' }}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}>
        {/* LANGUAGE */}
        <SectionLabel text={t('settings.language')} isRTL={isRTL} />
        <CardGroup>
          <Card>
            <View
              className="flex-row gap-2 p-1 rounded-full bg-[#f3f3f5]"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <LangChip
                label={t('settings.languageEnglish')}
                active={i18n.language === 'en'}
                onPress={() => setLang('en')}
              />
              <LangChip
                label={t('settings.languageArabic')}
                active={i18n.language === 'ar'}
                onPress={() => setLang('ar')}
              />
            </View>
          </Card>
        </CardGroup>

        {/* ACCOUNT */}
        <SectionLabel text={t('settings.account')} isRTL={isRTL} />
        {isAuthed && user ? (
          <CardGroup>
            <Card>
              <View
                className="flex-row items-center gap-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <View className="w-12 h-12 rounded-full bg-primary items-center justify-center">
                  <Text className="text-white text-[18px] font-extrabold">
                    {(user.username?.[0] ?? 'U').toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text
                    className="text-note text-[11px]"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('settings.signedInAs')}
                  </Text>
                  <Text
                    className="text-secondary text-[15px] font-extrabold"
                    numberOfLines={1}
                    style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {user.username ?? user.email}
                  </Text>
                  {user.email ? (
                    <Text
                      className="text-text text-[12px]"
                      numberOfLines={1}
                      style={{ textAlign: isRTL ? 'right' : 'left' }}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
              </View>
            </Card>
            <LinkCard
              icon="person-circle"
              label={t('settings.openProfile')}
              onPress={() => router.push('/(auth)/profile')}
              isRTL={isRTL}
            />
            <LinkCard
              icon="log-out"
              label={t('settings.signOut')}
              tone="danger"
              onPress={confirmSignOut}
              isRTL={isRTL}
            />
          </CardGroup>
        ) : (
          <CardGroup>
            <Card>
              <View
                className="flex-row items-center gap-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <View className="w-12 h-12 rounded-full bg-[#f3f3f5] items-center justify-center border border-line">
                  <Ionicons name="person-outline" size={22} color="#5c5e61" />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-secondary text-[15px] font-extrabold"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('settings.guest')}
                  </Text>
                  <Text
                    className="text-text text-[12px]"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {t('settings.guestSubtitle')}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.push('/(auth)/login')}
                className="mt-3 bg-primary rounded-xl py-3 active:opacity-90">
                <Text className="text-white text-center text-[14px] font-bold">
                  {t('settings.signIn')}
                </Text>
              </Pressable>
            </Card>
          </CardGroup>
        )}

        {/* STATS */}
        <SectionLabel text={t('settings.stats')} isRTL={isRTL} />
        <Text
          className="px-5 text-text text-[12px] -mt-1 mb-3"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('settings.statsSubtitle')}
        </Text>
        <View className="px-4">
          <View className="flex-row gap-3 flex-wrap">
            <StatTile
              icon="home-outline"
              tint="#f1913d"
              value={total}
              label={t('settings.totalListings')}
              loading={statsLoading}
            />
            <StatTile
              icon="people-outline"
              tint="#3b82f6"
              value={agents}
              label={t('settings.totalAgents')}
              loading={statsLoading}
            />
            <StatTile
              icon="key-outline"
              tint="#10b981"
              value={rent}
              label={t('settings.forRent')}
              loading={statsLoading}
            />
            <StatTile
              icon="pricetag-outline"
              tint="#a855f7"
              value={sale}
              label={t('settings.forSale')}
              loading={statsLoading}
            />
          </View>
        </View>

        {/* BROWSE */}
        <SectionLabel text={t('settings.browse')} isRTL={isRTL} />
        <CardGroup>
          <LinkCard
            icon="business"
            label={t('settings.projects')}
            onPress={() => router.push('/projects')}
            isRTL={isRTL}
          />
          <LinkCard
            icon="newspaper"
            label={t('blog.title')}
            onPress={() => router.push('/blogs' as never)}
            isRTL={isRTL}
          />
          <LinkCard
            icon="git-compare"
            label={t('compare.compare')}
            onPress={() => router.push('/compare' as never)}
            isRTL={isRTL}
          />
        </CardGroup>

        {/* SERVICES */}
        <SectionLabel text={t('settings.services')} isRTL={isRTL} />
        <CardGroup>
          <LinkCard
            icon="key"
            label={t('settings.rentalService')}
            onPress={() => router.push('/rental-service')}
            isRTL={isRTL}
          />
        </CardGroup>

        {/* SUPPORT & LEGAL */}
        <SectionLabel text={t('settings.support')} isRTL={isRTL} />
        <CardGroup>
          <LinkCard
            icon="help-circle"
            label={t('faqScreen.headerTitle')}
            onPress={() => router.push('/faq')}
            isRTL={isRTL}
          />
          <LinkCard
            icon="chatbubble-ellipses"
            label={t('contactScreen.headerTitle')}
            onPress={() => router.push('/contact')}
            isRTL={isRTL}
          />
          <LinkCard
            icon="star"
            label={t('interestedBuyer.headerTitle')}
            onPress={() => router.push('/interested-buyer')}
            isRTL={isRTL}
          />
          <LinkCard
            icon="shield-checkmark"
            label={t('legal.privacyPolicy')}
            onPress={() => openLegal('privacy', i18n.language)}
            isRTL={isRTL}
          />
          <LinkCard
            icon="document-text"
            label={t('legal.termsOfService')}
            onPress={() => openLegal('terms', i18n.language)}
            isRTL={isRTL}
          />
        </CardGroup>

        {/* FOLLOW US */}
        <SectionLabel text={t('socialMedia.title')} isRTL={isRTL} />
        <CardGroup>
          <Card>
            <Text
              className="text-text text-[12px] mb-3.5"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('socialMedia.subtitle')}
            </Text>
            <View
              className="flex-row items-center"
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                gap: 14,
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
              }}>
              {SOCIALS.map((s) => (
                <SocialButton key={s.key} item={s} label={t(`socialMedia.${s.key}`)} />
              ))}
            </View>
          </Card>
        </CardGroup>

        {/* ABOUT */}
        <SectionLabel text={t('settings.about')} isRTL={isRTL} />
        <CardGroup>
          <Card>
            <View
              className="flex-row items-center justify-between"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Text className="text-secondary text-[14px] font-semibold">
                {t('settings.version')}
              </Text>
              <Text className="text-text text-[14px]">{appVersion}</Text>
            </View>
          </Card>
        </CardGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

// Bold, dark group label (matches the reference settings design — no muted
// uppercase micro-text). One tier below SectionHeader's 18px section titles.
function SectionLabel({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <Text
      className="text-secondary text-[16px] font-bold px-5 mt-6 mb-3"
      style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {text}
    </Text>
  );
}

// Spaces standalone cards apart and gives the whole group its side gutters.
function CardGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="px-4" style={{ gap: 10 }}>
      {children}
    </View>
  );
}

// Generic white surface for grouped content (account, language, social, …).
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View className="bg-white rounded-2xl border border-line p-4" style={cardShadow}>
      {children}
    </View>
  );
}

// A single tappable setting rendered as its own card: icon · label · chevron.
function LinkCard({
  icon,
  label,
  onPress,
  tone,
  isRTL,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  tone?: 'danger';
  isRTL: boolean;
}) {
  const color = tone === 'danger' ? '#f2695c' : '#2c2e33';
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-line px-4 py-4 active:opacity-80"
      style={{
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 14,
        ...cardShadow,
      }}>
      <Ionicons name={icon} size={22} color={color} />
      <Text
        className="flex-1 text-[15px] font-semibold"
        style={{ color, textAlign: isRTL ? 'right' : 'left' }}>
        {label}
      </Text>
      <Ionicons
        name={isRTL ? 'chevron-back' : 'chevron-forward'}
        size={18}
        color="#a8abae"
      />
    </Pressable>
  );
}

function LangChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 py-2 rounded-full items-center ${
        active ? 'bg-primary' : ''
      }`}>
      <Text
        className={`text-[13px] font-bold ${
          active ? 'text-white' : 'text-secondary'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

function StatTile({
  icon,
  tint,
  value,
  label,
  loading,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  value: number | undefined;
  label: string;
  loading: boolean;
}) {
  return (
    <View
      className="bg-white rounded-2xl border border-line p-4"
      style={{ width: '47.5%', ...cardShadow }}>
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${tint}1A` }}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text className="text-secondary text-[22px] font-extrabold">
        {loading || value === undefined ? '—' : value.toLocaleString()}
      </Text>
      <Text className="text-text text-[12px] mt-0.5" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}
