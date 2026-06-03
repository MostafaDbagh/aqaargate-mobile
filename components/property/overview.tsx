import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { CrownIcon, LocationIcon, StarIcon } from '@/components/icons/svg-icons';
import { localizeCity } from '@/constants/cities';
import { getCurrencySymbol } from '@/constants/currencies';
import { localizePropertyType } from '@/constants/property-types';
import { normalizeRentType } from '@/constants/rent-types';
import type { ExtendedListing } from '@/apis/listing';

// English → Arabic translations for property keyword pills.
// Backend stores keywords in English; we localize for display.
const KEYWORD_AR: Record<string, string> = {
  'spacious': 'واسع',
  'well-ventilated': 'مهوي',
  'bright': 'مشمس',
  'modern building': 'مبنى حديث',
  'old building': 'مبنى قديم',
  'south-facing house': 'قبلي (جنوبي)',
  'south-facing': 'جنوبي',
  'north-facing': 'شمالي',
  'east-facing': 'شرقي',
  'west-facing': 'غربي',
  'view': 'إطلالة',
  'open view': 'إطلالة مفتوحة',
  'sea view': 'إطلالة بحرية',
  'mountain view': 'إطلالة جبلية',
  'luxury': 'فاخر',
  'modern': 'حديث',
  'furnished': 'مفروش',
  'unfurnished': 'غير مفروش',
  'cozy': 'مريح',
  'renovated': 'مجدّد',
  'new': 'جديد',
  'doublex finishing': 'إكساء ديلوكس',
  'super doublex finishing': 'إكساء سوبر ديلوكس',
  'standard finishing': 'إكساء عادي',
  'stone finishing': 'إكساء حجري',
  'green title deed': 'طابو أخضر',
  'shell house': 'بيت على العظم',
};

const translateKeyword = (raw: string, isAr: boolean) => {
  const k = raw.trim();
  if (!k) return '';
  if (!isAr) return k;
  return KEYWORD_AR[k.toLowerCase()] ?? k;
};

const parseKeywords = (raw?: string, isAr?: boolean): string[] => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((k) => translateKeyword(k, !!isAr))
    .filter(Boolean);
};

export function Overview({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const statusKey = (listing.status ?? '').toLowerCase();
  const isRent = statusKey.includes('rent');
  const isSale = statusKey.includes('sale');
  const statusLabel = isRent ? t('hero.forRent') : isSale ? t('hero.forSale') : listing.status;
  const city = localizeCity(listing.city ?? listing.state ?? '', i18n.language) || '';
  const neighborhood = (isAr && listing.neighborhood_ar) || listing.neighborhood || '';
  const fullLocation = [neighborhood, city, listing.country].filter(Boolean).join(' · ');
  const rentPeriodKey = normalizeRentType(listing.rentTypeOriginal || listing.rentType);
  const rentSuffix = isRent
    ? t(`properties.rentPeriod.${rentPeriodKey}`, { defaultValue: t('properties.rentPeriod.monthly') })
    : '';
  const localizedType = localizePropertyType(listing.propertyType, i18n.language) ?? listing.propertyType;
  const priceCode = (listing.currency || 'USD').toUpperCase();
  const keywordPills = parseKeywords(listing.propertyKeyword, isAr);

  const hasTags = !!(listing.status || listing.isVip || listing.isFeatured || keywordPills.length > 0);

  return (
    <View className="px-5 pt-4">
      {/* Price ──── property type on one row */}
      <View
        className="flex-row items-center justify-between"
        style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 10 }}>
        {/* Price */}
        <View
          className="flex-row items-center"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          {listing.propertyPrice == null ? (
            <Text className="text-secondary text-[26px] font-extrabold" style={{ letterSpacing: -0.6 }}>
              N/A
            </Text>
          ) : (
            <>
              <Text
                className="text-secondary text-[26px] font-extrabold"
                style={{ letterSpacing: -0.6 }}>
                {getCurrencySymbol(priceCode)}
              </Text>
              <Text
                className="text-secondary text-[26px] font-extrabold ml-1"
                style={{ letterSpacing: -0.6 }}>
                {Number(listing.propertyPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </>
          )}
          {rentSuffix ? (
            <Text className="text-text text-[13px] font-medium ml-1">{rentSuffix}</Text>
          ) : null}
        </View>

        {/* Property type */}
        <Text
          className="text-primary text-[18px] font-extrabold"
          numberOfLines={1}
          style={{ textAlign: isAr ? 'left' : 'right', letterSpacing: -0.3, flexShrink: 1 }}>
          {(keywordPills.length > 0 ? localizedType : listing.propertyKeyword) ??
            localizedType ??
            'Property'}
        </Text>
      </View>

      {/* Location — pin with the city/location line beside it */}
      {fullLocation ? (
        <View
          className="flex-row items-center gap-1.5 mt-3"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <LocationIcon size={16} color="#5c5e61" />
          <Text
            className="text-text text-[15px] flex-1"
            numberOfLines={2}
            style={{ textAlign: isAr ? 'right' : 'left' }}>
            {fullLocation}
          </Text>
        </View>
      ) : null}

      {/* Tags row (bottom) — status (For Sale / VIP / Featured) + keyword pills */}
      {hasTags ? (
        <View
          className="flex-row flex-wrap items-center mt-4"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 8, rowGap: 8 }}>
          {listing.status ? (
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: isRent ? '#3b82f6' : isSale ? '#10b981' : '#6b7280',
                flexDirection: isAr ? 'row-reverse' : 'row',
              }}>
              <Text
                className="text-white text-[11px] font-bold uppercase"
                style={{ letterSpacing: 0.4 }}>
                {statusLabel}
              </Text>
            </View>
          ) : null}
          {listing.isVip ? (
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#c79e34', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <CrownIcon size={12} color="#ffffff" />
              <Text
                className="text-white text-[11px] font-bold uppercase"
                style={{ letterSpacing: 0.4 }}>
                VIP
              </Text>
            </View>
          ) : listing.isFeatured ? (
            <View
              className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#7695ff', flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <StarIcon size={10} color="#ffffff" />
              <Text
                className="text-white text-[11px] font-bold uppercase"
                style={{ letterSpacing: 0.4 }}>
                {isAr ? 'مميز' : 'Featured'}
              </Text>
            </View>
          ) : null}
          {keywordPills.map((kw, i) => (
            <View
              key={`${kw}-${i}`}
              className="px-2.5 py-1 rounded-full"
              style={{ backgroundColor: '#fff3e6', borderWidth: 1, borderColor: '#f1913d33' }}>
              <Text className="text-primary text-[11px] font-semibold" style={{ letterSpacing: 0.2 }}>
                {kw}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
