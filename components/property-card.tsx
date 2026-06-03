import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View, type ViewStyle } from 'react-native';

import { useFavoriteIds, useToggleFavorite } from '@/apis/hooks';
import {
  AreaIcon,
  BathIcon,
  BedIcon,
  CrownIcon,
  LocationIcon,
  StarIcon,
} from '@/components/icons/svg-icons';
import { localizeCity } from '@/constants/cities';
import { getCurrencySymbol } from '@/constants/currencies';
import { localizePropertyType } from '@/constants/property-types';
import { normalizeRentType } from '@/constants/rent-types';
import { getSizeUnitLabel } from '@/constants/size-units';
import type { Listing } from '@/lib/api';

type Variant = 'vertical' | 'compact';
type BadgeOverride = 'featured' | 'roi';

type Props = {
  listing: Listing;
  /** 'vertical' = full image-on-top card (FEATURED/ROI); 'compact' = image-left row. */
  variant?: Variant;
  /** Force a corner badge. Otherwise derived from VIP / featured / status. */
  badge?: BadgeOverride;
  /** Show the Call / WhatsApp action buttons (vertical only). On by default; pass false to hide. */
  showContact?: boolean;
};

const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

const heartShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

/** Soft lift for the white meta tags (beds / baths / area). */
const tagShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
};

/** Abbreviate a price for the compact card: 1850000 → 1.85M, 8200 → 8.2K. */
function abbreviatePrice(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}M`;
  }
  if (n >= 1_000) {
    const v = n / 1_000;
    return `${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)}K`;
  }
  return String(n);
}

export function PropertyCard({ listing, variant = 'vertical', badge, showContact = true }: Props) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isAr = i18n.language === 'ar';
  const cover = listing.images?.[0]?.url;
  const openDetail = () => router.push(`/property/${listing._id}` as never);

  const statusKey = (listing.status ?? '').toLowerCase();
  const isRent = statusKey.includes('rent');
  const isSale = statusKey.includes('sale');
  const statusLabel = isRent ? t('hero.forRent') : isSale ? t('hero.forSale') : listing.status;

  // Rent period label (e.g. "/ month", "/ 3 months").
  const rentPeriodKey = normalizeRentType(listing.rentTypeOriginal || listing.rentType);
  const rentPeriodLabel = t(`properties.rentPeriod.${rentPeriodKey}`, {
    defaultValue: t('properties.rentPeriod.monthly'),
  });

  // Occupancy (daily rentals).
  const availableAfterDate = listing.availableAfter ? new Date(listing.availableAfter) : null;
  const availableAfterValid =
    !!availableAfterDate && !isNaN(availableAfterDate.getTime()) && availableAfterDate.getTime() > Date.now();
  const isOccupied = !!listing.isOccupied && (!availableAfterDate || availableAfterValid);
  const availableAfterLabel = availableAfterValid
    ? availableAfterDate!.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  // Holiday Home treatment.
  const rawType = listing.propertyType || '';
  const isHolidayHome = /^holiday\s*homes?$/i.test(rawType) || (!!listing.isHolidayHome && isRent);

  const city = localizeCity(listing.city ?? listing.state ?? '', i18n.language) || '';
  const neighborhood = (isAr && listing.neighborhood_ar) || listing.neighborhood || '';
  const locationText = neighborhood ? `${neighborhood}، ${city}` : city;
  const title = localizePropertyType(listing.propertyType, i18n.language) || listing.propertyType || '';

  const code = (listing.currency || 'USD').toUpperCase();

  // ---- Favorites (heart) — only for signed-in users ----
  const { ids, isAuthed } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const [pending, setPending] = useState<boolean | null>(null);
  const favorited = pending ?? ids.has(listing._id);
  const onHeart = () => {
    if (!isAuthed) return;
    const next = !favorited;
    setPending(next);
    toggleFav.mutate(
      { id: listing._id, favorited },
      { onSettled: () => setPending(null) }
    );
  };

  // ---- Shared pieces ----
  // ONE status tag — "For Sale" (green) / "For Rent" (blue) — with a single
  // trailing icon: 🏖️ for holiday homes, else crown (VIP) or star (Featured).
  type BadgeIcon = 'crown' | 'star' | 'holiday' | null;
  const cornerBadge = (() => {
    if (badge === 'roi') return { label: 'ROI', bg: '#f1913d', icon: null as BadgeIcon };
    const icon: BadgeIcon = isHolidayHome
      ? 'holiday'
      : listing.isVip
        ? 'crown'
        : listing.isFeatured || badge === 'featured'
          ? 'star'
          : null;
    if (isRent) return { label: statusLabel as string, bg: '#3b82f6', icon };
    if (isSale) return { label: statusLabel as string, bg: '#10b981', icon };
    if (listing.status) return { label: statusLabel as string, bg: '#6b7280', icon };
    return null;
  })();

  const HeartButton = ({ size = 36 }: { size?: number }) =>
    isAuthed ? (
      <Pressable
        onPress={onHeart}
        hitSlop={8}
        accessibilityRole="button"
        className="rounded-full bg-white items-center justify-center"
        style={[{ width: size, height: size }, heartShadow]}>
        <Ionicons
          name={favorited ? 'heart' : 'heart-outline'}
          size={size * 0.5}
          color="#f1913d"
        />
      </Pressable>
    ) : null;

  const Badge = ({ small = false }: { small?: boolean }) =>
    cornerBadge ? (
      <View
        className="flex-row items-center rounded-lg"
        style={{
          backgroundColor: cornerBadge.bg,
          paddingHorizontal: small ? 8 : 10,
          paddingVertical: small ? 3 : 5,
          gap: 5,
          flexDirection: isAr ? 'row-reverse' : 'row',
        }}>
        <Text
          className="text-white font-extrabold"
          style={{ fontSize: small ? 9 : 11, letterSpacing: 0.6 }}>
          {cornerBadge.label}
        </Text>
        {cornerBadge.icon === 'crown' ? (
          <CrownIcon size={small ? 13 : 15} color="#ffffff" />
        ) : cornerBadge.icon === 'star' ? (
          <StarIcon size={small ? 11 : 13} color="#ffffff" />
        ) : cornerBadge.icon === 'holiday' ? (
          <Text style={{ fontSize: small ? 11 : 13 }}>🏖️</Text>
        ) : null}
      </View>
    ) : null;

  const MetaRow = ({ compact = false }: { compact?: boolean }) => {
    const iconSize = compact ? 14 : 16;
    const valueClass = compact ? 'text-secondary text-[12px] font-bold' : 'text-secondary text-[13px] font-bold';
    const labelClass = compact ? 'text-text text-[12px] font-medium' : 'text-text text-[13px] font-medium';
    const rowDir = isAr ? 'row-reverse' : 'row';
    const beds = Number(listing.bedrooms);
    const baths = Number(listing.bathrooms);
    const capitalize = (s: string) => (isAr ? s : s.charAt(0).toUpperCase() + s.slice(1));

    const Tag = ({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: string }) => (
      <View
        className="flex-row items-center rounded-full bg-white border border-line"
        style={{
          flexDirection: rowDir,
          gap: 6,
          paddingHorizontal: compact ? 10 : 12,
          paddingVertical: compact ? 6 : 7,
          ...tagShadow,
        }}>
        {icon}
        <Text className={valueClass}>{value}</Text>
        <Text className={labelClass}>{label}</Text>
      </View>
    );

    return (
      <View
        className="flex-row items-center"
        style={{ flexDirection: rowDir, gap: compact ? 8 : 10, flexWrap: 'wrap', rowGap: 8 }}>
        {listing.bedrooms != null && beds > 0 ? (
          <Tag
            icon={<BedIcon size={iconSize} color="#5c5e61" />}
            value={listing.bedrooms}
            label={isAr ? 'غرف' : beds === 1 ? 'Bed' : 'Beds'}
          />
        ) : null}
        {listing.bathrooms != null && baths > 0 ? (
          <Tag
            icon={<BathIcon size={iconSize} color="#5c5e61" />}
            value={listing.bathrooms}
            label={isAr ? 'حمام' : baths === 1 ? 'Bath' : 'Baths'}
          />
        ) : null}
        {listing.size ? (
          <Tag
            icon={<AreaIcon size={iconSize} color="#5c5e61" />}
            value={listing.size}
            label={capitalize(getSizeUnitLabel(listing.sizeUnit, isAr))}
          />
        ) : null}
      </View>
    );
  };

  const LocationRow = ({ compact = false }: { compact?: boolean }) =>
    locationText ? (
      <View
        className="flex-row items-center"
        style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 5, marginTop: compact ? 3 : 4 }}>
        <LocationIcon size={compact ? 13 : 15} color="#f1913d" />
        <Text
          className={compact ? 'text-note text-[12px] flex-1' : 'text-note text-[13px] font-medium flex-1'}
          numberOfLines={1}
          style={{ textAlign: isAr ? 'right' : 'left' }}>
          {locationText}
        </Text>
      </View>
    ) : null;

  // ---------- COMPACT (image-left row) ----------
  if (variant === 'compact') {
    return (
      <Pressable
        onPress={openDetail}
        className="bg-white rounded-2xl overflow-hidden mb-3 border border-line active:opacity-95 p-2"
        style={[cardShadow, { flexDirection: isAr ? 'row-reverse' : 'row' }]}>
        <View style={{ width: 116, height: 116, borderRadius: 14, overflow: 'hidden' }}>
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} />
          ) : (
            <View className="w-full h-full bg-cream items-center justify-center">
              <Text className="text-note text-xs">No Image</Text>
            </View>
          )}
          <View className="absolute top-1.5" style={isAr ? { left: 6 } : { right: 6 }}>
            <HeartButton size={28} />
          </View>
        </View>

        <View className="flex-1 justify-center" style={{ paddingHorizontal: 12 }}>
          {listing.propertyPrice == null ? (
            <Text className="text-secondary text-[17px] font-extrabold" style={{ letterSpacing: -0.4 }}>
              N/A
            </Text>
          ) : (
            <View className="flex-row items-baseline" style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 4 }}>
              <Text className="text-secondary text-[17px] font-extrabold">{getCurrencySymbol(code)}</Text>
              <Text className="text-secondary text-[17px] font-extrabold" style={{ letterSpacing: -0.4 }} numberOfLines={1}>
                {abbreviatePrice(Number(listing.propertyPrice))}
              </Text>
            </View>
          )}
          <Text
            className="text-secondary text-[14px] font-bold mt-1"
            numberOfLines={1}
            style={{ textAlign: isAr ? 'right' : 'left', letterSpacing: -0.2 }}>
            {title}
          </Text>
          <LocationRow compact />
          <View className="mt-2">
            <MetaRow compact />
          </View>
        </View>
      </Pressable>
    );
  }

  // ---------- VERTICAL (image on top) ----------
  return (
    <Pressable
      onPress={openDetail}
      className="bg-white rounded-2xl overflow-hidden mb-4 border border-line active:opacity-95"
      style={cardShadow}>
      <View className="relative" style={{ aspectRatio: 3 / 2 }}>
        {cover ? (
          <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} />
        ) : (
          <View className="w-full h-full bg-cream items-center justify-center">
            <Text className="text-note text-sm">No Image</Text>
          </View>
        )}

        {/* Top-left badge */}
        <View className="absolute top-3 left-3">
          <Badge />
        </View>

        {/* Top-right heart (signed-in users only) */}
        <View className="absolute top-3 right-3">
          <HeartButton size={36} />
        </View>

        {/* Occupied badge (bottom-right) */}
        {isOccupied ? (
          <View
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: 'rgba(17,24,39,0.85)' }}>
            <Text className="text-white text-[11px] font-bold tracking-tight">{t('properties.occupied')}</Text>
          </View>
        ) : null}
      </View>

      <View className="px-4 pt-3.5 pb-4">
        {/* Availability row — occupied daily rentals only */}
        {isOccupied && availableAfterLabel ? (
          <View
            className="flex-row items-center gap-1.5 mb-2"
            style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <Ionicons name="calendar-outline" size={13} color="#5c5e61" />
            <Text className="text-text text-[12px] font-medium">
              {t('properties.availableAfter', { date: availableAfterLabel })}
            </Text>
          </View>
        ) : null}

        {/* Price + property type on one row: price ──── type */}
        <View
          className="flex-row items-center justify-between"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 10 }}>
          {/* Price */}
          {listing.propertyPrice == null ? (
            <Text className="text-secondary text-[22px] font-extrabold" style={{ letterSpacing: -0.7, lineHeight: 26 }}>
              N/A
            </Text>
          ) : (
            <View
              className="flex-row items-baseline"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 4 }}>
              <Text className="text-secondary text-[22px] font-extrabold" style={{ letterSpacing: -0.4, lineHeight: 26 }}>
                {getCurrencySymbol(code)}
              </Text>
              <Text
                className="text-secondary text-[22px] font-extrabold"
                style={{ letterSpacing: -0.7, lineHeight: 26 }}
                numberOfLines={1}>
                {Number(listing.propertyPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          )}

          {/* Property type */}
          {title ? (
            <Text
              className="text-primary text-[16px] font-extrabold"
              numberOfLines={1}
              style={{ textAlign: isAr ? 'left' : 'right', letterSpacing: -0.3, flexShrink: 1 }}>
              {title}
            </Text>
          ) : null}
        </View>

        {/* Rent period sub-line */}
        {isRent ? (
          <Text className="text-note text-[12px] font-medium mt-0.5" style={{ textAlign: isAr ? 'right' : 'left' }}>
            {rentPeriodLabel}
          </Text>
        ) : null}

        {/* Location */}
        <View className="mt-2">
          <LocationRow />
        </View>

        {/* Divider */}
        <View className="border-t border-line my-3" />

        {/* Meta */}
        <MetaRow />

        {/* Contact action buttons — flat text style, above a divider */}
        {showContact && (listing.agentNumber || listing.agentWhatsapp) ? (
          <>
            <View className="border-t border-line mt-3" />
            <View
              className="flex-row items-center mt-2.5"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 24 }}>
              {listing.agentNumber ? (
                <Pressable
                  onPress={() => Linking.openURL(`tel:${listing.agentNumber}`)}
                  hitSlop={6}
                  className="flex-row items-center gap-1.5 active:opacity-60"
                  style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <Ionicons name="call" size={15} color="#f1913d" />
                  <Text className="text-primary text-[14px] font-bold">{t('propertyDetail.call')}</Text>
                </Pressable>
              ) : null}
              {listing.agentWhatsapp ? (
                <Pressable
                  onPress={() => {
                    const num = (listing.agentWhatsapp || '').replace(/[^\d+]/g, '').replace('+', '');
                    Linking.openURL(`https://wa.me/${num}`);
                  }}
                  hitSlop={6}
                  className="flex-row items-center gap-1.5 active:opacity-60"
                  style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <Ionicons name="logo-whatsapp" size={15} color="#25D366" />
                  <Text className="text-[14px] font-bold" style={{ color: '#25D366' }}>
                    WhatsApp
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}
