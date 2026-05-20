import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

import type { Project, ProjectUnitType } from '@/apis/project';
import { useProject } from '@/apis/hooks';

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

const formatDate = (iso: string | undefined, locale: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar' : 'en-US', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return '';
  }
};

export default function ProjectDetailScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: project, isLoading, isError, refetch } = useProject(id);

  const onShare = async () => {
    if (!project) return;
    const url = `https://aqaargate.com/projects/${project.slug ?? project._id}`;
    await Share.share({
      message: `${project.name} — ${url}`,
      url,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView
        edges={['top']}
        className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <View
          className="flex-row items-center justify-between px-4 pt-2"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('settings.back')}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white">
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color="#2c2e33"
            />
          </Pressable>
          <Pressable
            onPress={onShare}
            accessibilityLabel={t('propertyDetail.share') ?? 'Share'}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white">
            <Ionicons name="share-outline" size={20} color="#2c2e33" />
          </Pressable>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f1913d" />
        </View>
      ) : isError || !project ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-text mb-3">{t('projectsScreen.errorMessage')}</Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-primary px-5 py-2.5 rounded-full">
            <Text className="text-white font-semibold">
              {t('projectsScreen.retry')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <ProjectBody
          project={project}
          isRTL={isRTL}
          locale={i18n.language}
        />
      )}
    </View>
  );
}

function ProjectBody({
  project,
  isRTL,
  locale,
}: {
  project: Project;
  isRTL: boolean;
  locale: string;
}) {
  const { t } = useTranslation();
  const name = isRTL ? project.name_ar || project.name : project.name;
  const description = isRTL
    ? project.description_ar || project.description
    : project.description;
  const developerName = isRTL
    ? project.developer?.name_ar || project.developer?.name
    : project.developer?.name;
  const cityLine = [
    isRTL ? project.neighborhood_ar || project.neighborhood : project.neighborhood,
    project.city,
  ]
    .filter(Boolean)
    .join(', ');
  const priceText = formatPriceRange(
    project.startingPrice,
    project.endingPrice,
    project.currency
  );
  const handoverDate = formatDate(project.handoverDate, locale);
  const launchDate = formatDate(project.launchDate, locale);

  const onCall = () => {
    if (project.contactPhone)
      Linking.openURL(`tel:${project.contactPhone.replace(/\s+/g, '')}`);
  };
  const onEmail = () => {
    if (project.contactEmail) Linking.openURL(`mailto:${project.contactEmail}`);
  };
  const onWhatsApp = () => {
    const wa = (project.contactWhatsapp || project.contactPhone || '').replace(
      /[^\d+]/g,
      ''
    );
    if (wa) Linking.openURL(`https://wa.me/${wa.replace('+', '')}`);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}>
      {/* Cover */}
      {project.coverImage ? (
        <Image
          source={{ uri: project.coverImage }}
          style={{ width: '100%', height: 260 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View className="w-full h-[260px] bg-cream items-center justify-center">
          <Ionicons name="business-outline" size={64} color="#a8abae" />
        </View>
      )}

      <View className="px-5 pt-4">
        <View
          className="flex-row items-center gap-2 mb-2"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <View
            className={`px-2 py-0.5 rounded-full ${
              project.status === 'ready' ? 'bg-[#10b9811A]' : 'bg-[#f1913d1A]'
            }`}>
            <Text
              className={`text-[11px] font-bold ${
                project.status === 'ready' ? 'text-[#10b981]' : 'text-primary'
              }`}>
              {project.status === 'ready'
                ? t('projectsScreen.statusReady')
                : t('projectsScreen.statusOffPlan')}
            </Text>
          </View>
          {project.isFeatured ? (
            <View className="px-2 py-0.5 rounded-full bg-[#a855f71A] flex-row items-center gap-1">
              <Ionicons name="star" size={10} color="#a855f7" />
              <Text className="text-[11px] font-bold text-[#a855f7]">
                {t('projectsScreen.featured')}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          className="text-secondary text-[22px] font-extrabold"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {name}
        </Text>

        {developerName ? (
          <Text
            className="text-text text-[13px] mt-1"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('projectsScreen.byDeveloper', { developer: developerName })}
          </Text>
        ) : null}

        {cityLine ? (
          <View
            className="flex-row items-center gap-1 mt-2"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Ionicons name="location-outline" size={16} color="#5c5e61" />
            <Text className="text-text text-[13px]">{cityLine}</Text>
          </View>
        ) : null}

        {priceText ? (
          <Text
            className="text-primary text-[20px] font-extrabold mt-3"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {priceText}
          </Text>
        ) : null}
      </View>

      {/* Quick stats */}
      <View className="px-5 mt-4">
        <View className="flex-row gap-3 flex-wrap">
          <StatTile
            icon="business-outline"
            label={t('projectsScreen.totalUnits')}
            value={project.totalUnits?.toString() ?? '—'}
          />
          <StatTile
            icon="key-outline"
            label={t('projectsScreen.availableUnits')}
            value={project.availableUnits?.toString() ?? '—'}
          />
          {handoverDate ? (
            <StatTile
              icon="calendar-outline"
              label={t('projectsScreen.handover')}
              value={handoverDate}
            />
          ) : null}
          {launchDate ? (
            <StatTile
              icon="rocket-outline"
              label={t('projectsScreen.launch')}
              value={launchDate}
            />
          ) : null}
        </View>
      </View>

      {/* Progress */}
      {typeof project.overallProgress === 'number' &&
      project.overallProgress > 0 ? (
        <View className="mx-5 mt-4 p-4 bg-cream rounded-2xl border border-line">
          <View
            className="flex-row items-center justify-between mb-2"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text className="text-secondary text-[13px] font-bold">
              {t('projectsScreen.overallProgress')}
            </Text>
            <Text className="text-primary text-[13px] font-extrabold">
              {project.overallProgress}%
            </Text>
          </View>
          <View className="h-2 bg-white rounded-full overflow-hidden border border-line">
            <View
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, project.overallProgress)}%` }}
            />
          </View>
        </View>
      ) : null}

      {/* Description */}
      {description ? (
        <View className="px-5 mt-5">
          <Text
            className="text-secondary text-[15px] font-extrabold mb-2"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('projectsScreen.about')}
          </Text>
          <Text
            className="text-text text-[14px] leading-5"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {description}
          </Text>
        </View>
      ) : null}

      {/* Unit types */}
      {project.unitTypes && project.unitTypes.length > 0 ? (
        <View className="px-5 mt-5">
          <Text
            className="text-secondary text-[15px] font-extrabold mb-2"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('projectsScreen.unitTypes')}
          </Text>
          {project.unitTypes.map((u, idx) => (
            <UnitRow
              key={u._id ?? idx}
              unit={u}
              isRTL={isRTL}
              currency={project.currency}
            />
          ))}
        </View>
      ) : null}

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 ? (
        <View className="mt-5">
          <Text
            className="px-5 text-secondary text-[15px] font-extrabold mb-2"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('projectsScreen.gallery')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
            {project.gallery.map((g, idx) => (
              <Image
                key={g.publicId ?? `${g.url}-${idx}`}
                source={{ uri: g.url }}
                style={{ width: 220, height: 140, borderRadius: 12 }}
                contentFit="cover"
                transition={150}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Contact */}
      {project.contactPhone ||
      project.contactEmail ||
      project.contactWhatsapp ? (
        <View className="px-5 mt-6">
          <Text
            className="text-secondary text-[15px] font-extrabold mb-2"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('projectsScreen.contact')}
          </Text>
          <View
            className="flex-row gap-2"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            {project.contactPhone ? (
              <ContactButton
                icon="call-outline"
                label={t('projectsScreen.call')}
                onPress={onCall}
              />
            ) : null}
            {project.contactWhatsapp || project.contactPhone ? (
              <ContactButton
                icon="logo-whatsapp"
                label="WhatsApp"
                onPress={onWhatsApp}
              />
            ) : null}
            {project.contactEmail ? (
              <ContactButton
                icon="mail-outline"
                label={t('projectsScreen.email')}
                onPress={onEmail}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View
      className="bg-white rounded-2xl border border-line p-3"
      style={{ width: '47.5%' }}>
      <View className="w-9 h-9 rounded-full bg-cream items-center justify-center mb-2">
        <Ionicons name={icon} size={18} color="#f1913d" />
      </View>
      <Text className="text-secondary text-[15px] font-extrabold" numberOfLines={1}>
        {value}
      </Text>
      <Text className="text-text text-[12px] mt-0.5" numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function UnitRow({
  unit,
  isRTL,
  currency,
}: {
  unit: ProjectUnitType;
  isRTL: boolean;
  currency?: string;
}) {
  const name = isRTL ? unit.name_ar || unit.name : unit.name;
  const price = formatPriceRange(unit.priceFrom, unit.priceTo, currency);
  const sizeParts: string[] = [];
  if (unit.sizeFrom && unit.sizeTo && unit.sizeFrom !== unit.sizeTo) {
    sizeParts.push(`${unit.sizeFrom} – ${unit.sizeTo} ${unit.sizeUnit ?? 'sqm'}`);
  } else if (unit.sizeFrom || unit.sizeTo) {
    sizeParts.push(`${unit.sizeFrom ?? unit.sizeTo} ${unit.sizeUnit ?? 'sqm'}`);
  }
  const bedBath: string[] = [];
  if (unit.bedrooms !== undefined) bedBath.push(`${unit.bedrooms} bd`);
  if (unit.bathrooms !== undefined) bedBath.push(`${unit.bathrooms} ba`);

  return (
    <View className="bg-cream rounded-2xl border border-line p-3 mb-2">
      <Text
        className="text-secondary text-[14px] font-extrabold"
        style={{ textAlign: isRTL ? 'right' : 'left' }}
        numberOfLines={1}>
        {name ?? '—'}
      </Text>
      <View
        className="flex-row flex-wrap gap-x-3 gap-y-1 mt-1"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        {bedBath.length > 0 ? (
          <Text className="text-text text-[12px]">{bedBath.join(' · ')}</Text>
        ) : null}
        {sizeParts.length > 0 ? (
          <Text className="text-text text-[12px]">{sizeParts.join(' ')}</Text>
        ) : null}
      </View>
      {price ? (
        <Text
          className="text-primary text-[14px] font-extrabold mt-1"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {price}
        </Text>
      ) : null}
    </View>
  );
}

function ContactButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-primary rounded-xl py-3 items-center active:opacity-90 flex-row justify-center gap-2">
      <Ionicons name={icon} size={16} color="#ffffff" />
      <Text className="text-white text-[13px] font-bold">{label}</Text>
    </Pressable>
  );
}
