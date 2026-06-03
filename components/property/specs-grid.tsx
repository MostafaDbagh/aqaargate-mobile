import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { useToast } from '@/components/feedback/toast';
import { AreaIcon, BathIcon, BedIcon } from '@/components/icons/svg-icons';
import { localizeListingStatus } from '@/constants/listing-status';
import { localizePropertyType } from '@/constants/property-types';
import { getSizeUnitLabel } from '@/constants/size-units';
import type { ExtendedListing } from '@/apis/listing';

/** Soft, low-contrast lift shared by the spec cards. */
const softShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export function QuickSpecs({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isLand = listing.propertyType === 'Land';

  const cells: { icon: React.ReactNode; value: string; label: string }[] = [];
  if (!isLand && listing.bedrooms != null && Number(listing.bedrooms) > 0) {
    cells.push({
      icon: <BedIcon size={20} color="#f1913d" />,
      value: String(listing.bedrooms),
      label: t('propertyDetail.bedrooms'),
    });
  }
  if (listing.bathrooms != null && Number(listing.bathrooms) > 0) {
    cells.push({
      icon: <BathIcon size={20} color="#f1913d" />,
      value: String(listing.bathrooms),
      label: t('propertyDetail.bathrooms'),
    });
  }
  cells.push({
    icon: <AreaIcon size={20} color="#f1913d" />,
    value: `${listing.size ?? 0}`,
    label: getSizeUnitLabel(listing.sizeUnit, isAr),
  });

  return (
    <View
      className="mx-5 mt-4 flex-row"
      style={{ gap: 10, flexDirection: isAr ? 'row-reverse' : 'row' }}>
      {cells.map((c, i) => (
        <SpecCell key={i} icon={c.icon} value={c.value} label={c.label} />
      ))}
    </View>
  );
}

function SpecCell({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View
      className="flex-1 items-center bg-white border border-line rounded-2xl py-4"
      style={softShadow}>
      <View
        className="w-11 h-11 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: '#fff3e6' }}>
        {icon}
      </View>
      <Text className="text-secondary text-[18px] font-extrabold" style={{ letterSpacing: -0.3 }}>
        {value}
      </Text>
      <Text className="text-note text-[11px] font-semibold mt-0.5">{label}</Text>
    </View>
  );
}

export function DetailsGrid({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const isAr = i18n.language === 'ar';
  const yes = isAr ? 'نعم' : 'Yes';
  const no = isAr ? 'لا' : 'No';

  const copyId = async (value: string) => {
    await Clipboard.setStringAsync(value);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast.success(t('propertyDetail.copied'));
  };

  const rows: { label: string; value: string; copyable?: boolean }[] = [];
  if (listing.propertyId) rows.push({ label: t('propertyDetail.id'), value: listing.propertyId, copyable: true });
  if (listing.propertyType)
    rows.push({ label: t('propertyDetail.type'), value: localizePropertyType(listing.propertyType, i18n.language) ?? listing.propertyType });
  if (listing.status)
    rows.push({ label: t('propertyDetail.status'), value: localizeListingStatus(listing.status, i18n.language) ?? listing.status });
  if (listing.bedrooms != null) rows.push({ label: t('propertyDetail.bedrooms'), value: String(listing.bedrooms) });
  if (listing.bathrooms != null) rows.push({ label: t('propertyDetail.bathrooms'), value: String(listing.bathrooms) });
  if (listing.size != null) rows.push({ label: t('propertyDetail.size'), value: `${listing.size} ${getSizeUnitLabel(listing.sizeUnit, isAr)}` });
  if (listing.landArea) rows.push({ label: t('propertyDetail.landArea'), value: `${listing.landArea} ${getSizeUnitLabel(listing.sizeUnit, isAr)}` });
  if (listing.floor != null) rows.push({ label: t('propertyDetail.floor'), value: String(listing.floor) });
  if (listing.yearBuilt) rows.push({ label: t('propertyDetail.yearBuilt'), value: String(listing.yearBuilt) });
  if (listing.garages) rows.push({ label: t('propertyDetail.garages'), value: listing.garageSize ? String(listing.garageSize) : yes });
  if (listing.furnished != null) rows.push({ label: t('propertyDetail.furnished'), value: listing.furnished ? yes : no });

  if (rows.length === 0) return null;

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.propertyDetails')} />
      <View
        className="flex-row flex-wrap"
        style={{ justifyContent: 'space-between', rowGap: 10, flexDirection: isAr ? 'row-reverse' : 'row' }}>
        {rows.map((r) =>
          r.copyable ? (
            <Pressable
              key={r.label}
              onPress={() => copyId(r.value)}
              accessibilityRole="button"
              accessibilityLabel={`${r.label}: ${r.value}`}
              className="bg-white border border-line rounded-2xl px-4 py-3 active:opacity-70"
              style={[softShadow, { width: '48%' }]}>
              <View
                className="flex-row items-center justify-between"
                style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <Text className="text-note text-[12px] font-medium">{r.label}</Text>
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#fff3e6' }}>
                  <Ionicons name="copy-outline" size={13} color="#f1913d" />
                </View>
              </View>
              <Text
                className="text-secondary text-[15px] font-bold mt-1"
                style={{ textAlign: isAr ? 'right' : 'left' }}>
                {r.value}
              </Text>
            </Pressable>
          ) : (
            <View
              key={r.label}
              className="bg-white border border-line rounded-2xl px-4 py-3"
              style={[softShadow, { width: '48%' }]}>
              <Text
                className="text-note text-[12px] font-medium"
                style={{ textAlign: isAr ? 'right' : 'left' }}>
                {r.label}
              </Text>
              <Text
                className="text-secondary text-[15px] font-bold mt-1"
                style={{ textAlign: isAr ? 'right' : 'left' }}>
                {r.value}
              </Text>
            </View>
          )
        )}
      </View>
    </View>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-2 mb-2.5">
      <View className="w-1 h-[18px] rounded-full bg-primary" />
      <Text
        className="text-secondary text-[17px] font-bold"
        style={{ letterSpacing: -0.3 }}>
        {title}
      </Text>
    </View>
  );
}

// Re-export Ionicons typeguard to keep callers tree-shakable if needed
export { Ionicons };
