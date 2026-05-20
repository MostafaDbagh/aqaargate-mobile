import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { CrownIcon, LocationIcon, StarIcon } from '@/components/icons/svg-icons';
import type { ExtendedListing } from '@/apis/listing';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SYP: 'ل.س',
  AED: 'د.إ',
  SAR: 'ر.س',
};

const formatPrice = (price?: number, currency?: string) => {
  if (!price) return '—';
  const code = (currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? '$';
  return `${symbol}${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};

export function Overview({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const statusKey = (listing.status ?? '').toLowerCase();
  const isRent = statusKey.includes('rent');
  const isSale = statusKey.includes('sale');
  const statusLabel = isRent ? t('hero.forRent') : isSale ? t('hero.forSale') : listing.status;
  const city = listing.city ?? listing.state ?? '';
  const neighborhood = (isAr && listing.neighborhood_ar) || listing.neighborhood || '';
  const address = (isAr && listing.address_ar) || listing.address || '';
  const fullLocation = [neighborhood, city, listing.country].filter(Boolean).join(' · ');
  const rentSuffix = isRent ? ` / ${listing.rentType ?? 'month'}` : '';

  return (
    <View className="px-5 pt-4">
      {/* Status + VIP/Featured badges row */}
      <View className="flex-row items-center gap-1.5 mb-2.5">
        {listing.status ? (
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: isRent ? '#3b82f6' : isSale ? '#10b981' : '#6b7280' }}>
            <Text
              className="text-white text-[11px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              {statusLabel}
            </Text>
          </View>
        ) : null}
        {listing.isVip ? (
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#c79e34' }}>
            <CrownIcon size={12} color="#ffffff" />
            <Text
              className="text-white text-[11px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              VIP
            </Text>
          </View>
        ) : listing.isFeatured ? (
          <View
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: '#7695ff' }}>
            <StarIcon size={10} color="#ffffff" />
            <Text
              className="text-white text-[11px] font-bold uppercase"
              style={{ letterSpacing: 0.4 }}>
              {isAr ? 'مميز' : 'Featured'}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Price (Bayut leads with price, prominent) */}
      <View className="flex-row items-baseline">
        <Text
          className="text-secondary text-[26px] font-extrabold"
          style={{ letterSpacing: -0.6 }}>
          {formatPrice(listing.propertyPrice, listing.currency)}
        </Text>
        {rentSuffix ? (
          <Text className="text-text text-[13px] font-medium ml-1">{rentSuffix}</Text>
        ) : null}
      </View>

      {/* Title */}
      <Text
        className="text-secondary text-[18px] font-bold leading-[24px] mt-2"
        style={{ letterSpacing: -0.3 }}>
        {listing.propertyKeyword ?? listing.propertyType ?? 'Property'}
      </Text>

      {/* Address */}
      {address ? (
        <View className="flex-row items-center gap-1.5 mt-1.5">
          <LocationIcon size={16} color="#5c5e61" />
          <Text className="text-text text-[15px] flex-1" numberOfLines={2}>
            {address}
          </Text>
        </View>
      ) : null}

      {fullLocation ? (
        <Text className="text-note text-[14px] mt-1 font-medium">{fullLocation}</Text>
      ) : null}
    </View>
  );
}
