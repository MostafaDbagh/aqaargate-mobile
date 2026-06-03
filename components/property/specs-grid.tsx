import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { AreaIcon, BathIcon, BedIcon } from '@/components/icons/svg-icons';
import { localizeListingStatus } from '@/constants/listing-status';
import { localizePropertyType } from '@/constants/property-types';
import { getSizeUnitLabel } from '@/constants/size-units';
import type { ExtendedListing } from '@/apis/listing';

export function QuickSpecs({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const isLand = listing.propertyType === 'Land';
  return (
    <View className="mx-5 mt-4 flex-row items-center justify-around bg-cream rounded-xl py-3 px-2">
      {!isLand && listing.bedrooms != null && Number(listing.bedrooms) > 0 ? (
        <SpecCell icon={<BedIcon size={18} color="#f1913d" />} value={String(listing.bedrooms)} label={t('propertyDetail.bedrooms')} />
      ) : null}
      {listing.bathrooms != null && Number(listing.bathrooms) > 0 ? (
        <SpecCell icon={<BathIcon size={18} color="#f1913d" />} value={String(listing.bathrooms)} label={t('propertyDetail.bathrooms')} />
      ) : null}
      <SpecCell
        icon={<AreaIcon size={18} color="#f1913d" />}
        value={`${listing.size ?? 0}`}
        label={getSizeUnitLabel(listing.sizeUnit, isAr)}
      />
    </View>
  );
}

function SpecCell({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View className="items-center flex-1">
      <View className="w-9 h-9 rounded-lg bg-white items-center justify-center mb-1">
        {icon}
      </View>
      <Text
        className="text-secondary text-[15px] font-extrabold"
        style={{ letterSpacing: -0.3 }}>
        {value}
      </Text>
      <Text
        className="text-note text-[10px] font-bold uppercase mt-0.5"
        style={{ letterSpacing: 0.6 }}>
        {label}
      </Text>
    </View>
  );
}

export function DetailsGrid({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const yes = isAr ? 'نعم' : 'Yes';
  const no = isAr ? 'لا' : 'No';
  const rows: { label: string; value: string }[] = [];
  if (listing.propertyId) rows.push({ label: t('propertyDetail.id'), value: listing.propertyId });
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
      <View className="bg-white border border-line rounded-xl overflow-hidden">
        {rows.map((r, i) => (
          <View
            key={r.label}
            className={`flex-row items-center justify-between px-3.5 py-2.5 ${
              i !== rows.length - 1 ? 'border-b border-line' : ''
            }`}>
            <Text className="text-text text-[13px]">{r.label}</Text>
            <Text className="text-secondary text-[13px] font-semibold">{r.value}</Text>
          </View>
        ))}
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
