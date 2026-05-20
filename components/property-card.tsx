import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import {
  AreaIcon,
  BathIcon,
  BedIcon,
  CrownIcon,
  LocationIcon,
  StarIcon,
} from '@/components/icons/svg-icons';
import type { Listing } from '@/lib/api';

type ExtendedListing = Listing & {
  neighborhood?: string;
  neighborhood_ar?: string;
  agentNumber?: string;
  agentWhatsapp?: string;
  isVip?: boolean;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  SYP: 'ل.س',
  AED: 'د.إ',
  SAR: 'ر.س',
};

const formatPriceParts = (price?: number, currency?: string): { symbol: string; amount: string } => {
  if (!price) return { symbol: '', amount: '—' };
  const code = (currency || 'USD').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? '$';
  const amount = price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return { symbol, amount };
};

export function PropertyCard({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isAr = i18n.language === 'ar';
  const cover = listing.images?.[0]?.url;
  const openDetail = () => router.push(`/property/${listing._id}` as never);

  const statusKey = (listing.status ?? '').toLowerCase();
  const isRent = statusKey.includes('rent');
  const isSale = statusKey.includes('sale');
  const statusLabel = isRent ? t('hero.forRent') : isSale ? t('hero.forSale') : listing.status;

  const city = listing.city ?? listing.state ?? '';
  const neighborhood = (isAr && listing.neighborhood_ar) || listing.neighborhood || '';
  const locationText = neighborhood ? `${city} - ${neighborhood}` : city;

  const handleCall = () => {
    if (listing.agentNumber) Linking.openURL(`tel:${listing.agentNumber}`);
  };
  const handleWhatsApp = () => {
    if (listing.agentWhatsapp) {
      const num = listing.agentWhatsapp.replace(/[^\d+]/g, '');
      Linking.openURL(`https://wa.me/${num.replace('+', '')}`);
    }
  };

  return (
    <Pressable
      onPress={openDetail}
      className="bg-white rounded-2xl overflow-hidden mb-4 border border-line active:opacity-90"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}>
      {/* IMAGE — 3:2 aspect ratio (matches web) */}
      <View className="relative" style={{ aspectRatio: 3 / 2 }}>
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="w-full h-full bg-cream items-center justify-center">
            <Text className="text-note text-sm">No Image</Text>
          </View>
        )}

        {/* Status badge — green for sale, blue for rent (web colors) */}
        {listing.status ? (
          <View
            className="absolute top-3 left-3 flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ backgroundColor: isRent ? '#3b82f6' : isSale ? '#10b981' : '#6b7280' }}>
            <Text className="text-white text-[13px] font-extrabold tracking-tight">
              {statusLabel}
            </Text>
            {listing.isVip ? (
              <CrownIcon size={16} color="#ffffff" />
            ) : listing.isFeatured ? (
              <StarIcon size={14} color="#ffffff" />
            ) : null}
          </View>
        ) : null}
      </View>

      {/* CONTENT */}
      <View className="px-4 pt-3.5 pb-3.5">
        {/* Price row — refined, prominent, sexy */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            {(() => {
              const { symbol, amount } = formatPriceParts(listing.propertyPrice, listing.currency);
              return (
                <View className="flex-row items-baseline gap-1">
                  {symbol ? (
                    <Text
                      className="text-secondary text-[22px] font-extrabold"
                      style={{ letterSpacing: -0.7, lineHeight: 26 }}>
                      {symbol}
                    </Text>
                  ) : null}
                  <Text
                    className="text-secondary text-[22px] font-extrabold flex-shrink"
                    style={{ letterSpacing: -0.7, lineHeight: 26 }}
                    numberOfLines={1}>
                    {amount}
                  </Text>
                </View>
              );
            })()}
            {isRent ? (
              <Text className="text-note text-[11px] font-medium -mt-0.5">/ month</Text>
            ) : null}
          </View>
          {listing.propertyType ? (
            <View className="bg-primary-50 rounded-lg px-3 py-1.5">
              <Text
                className="text-primary text-[13px] font-extrabold uppercase"
                style={{ letterSpacing: 0.6 }}>
                {listing.propertyType}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-1.5 mt-3">
          <LocationIcon size={15} color="#5c5e61" />
          <Text
            className="text-secondary text-[14px] font-semibold flex-1 leading-[20px]"
            numberOfLines={1}>
            {locationText}
          </Text>
        </View>

        {/* Meta list — chips with vertical dividers, refined weight */}
        <View
          className="flex-row items-center mt-3.5 bg-cream rounded-xl px-4 py-3"
          style={{ gap: 0 }}>
          {listing.bedrooms != null && Number(listing.bedrooms) > 0 ? (
            <MetaItem
              icon={<BedIcon size={18} color="#5c5e61" />}
              value={String(listing.bedrooms)}
              label="Beds"
            />
          ) : null}
          {listing.bathrooms != null && Number(listing.bathrooms) > 0 ? (
            <>
              <MetaDivider />
              <MetaItem
                icon={<BathIcon size={18} color="#5c5e61" />}
                value={String(listing.bathrooms)}
                label="Baths"
              />
            </>
          ) : null}
          {listing.size ? (
            <>
              <MetaDivider />
              <MetaItem
                icon={<AreaIcon size={18} color="#5c5e61" />}
                value={String(listing.size)}
                label={listing.sizeUnit || 'sqm'}
              />
            </>
          ) : null}
        </View>

        {/* Contact buttons — Call + WhatsApp */}
        {(listing.agentNumber || listing.agentWhatsapp) ? (
          <View className="flex-row gap-2 mt-3">
            {listing.agentNumber ? (
              <Pressable
                onPress={handleCall}
                className="flex-1 flex-row items-center justify-center gap-1.5 bg-white border border-primary rounded-lg py-2 active:bg-primary-50">
                <Ionicons name="call-outline" size={13} color="#f1913d" />
                <Text className="text-primary text-[12px] font-bold">Call</Text>
              </Pressable>
            ) : null}
            {listing.agentWhatsapp ? (
              <Pressable
                onPress={handleWhatsApp}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2 active:opacity-80"
                style={{ backgroundColor: '#25D366' }}>
                <Ionicons name="logo-whatsapp" size={13} color="#ffffff" />
                <Text className="text-white text-[12px] font-bold">WhatsApp</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

    </Pressable>
  );
}

function MetaItem({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label?: string;
}) {
  return (
    <View className="flex-row items-center gap-2 flex-1 justify-center">
      {icon}
      <View className="flex-row items-baseline gap-1">
        <Text
          className="text-secondary text-[16px] font-extrabold"
          style={{ letterSpacing: -0.3 }}>
          {value}
        </Text>
        {label ? (
          <Text className="text-text text-[13px] font-medium">{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

function MetaDivider() {
  return <View className="w-px h-5 bg-line/80" />;
}
