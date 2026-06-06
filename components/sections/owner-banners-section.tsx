import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { SectionHeader } from './section-header';

// Mirrors the canonical WhatsApp number (app/contact.tsx PHONE_E164).
const OWNER_WHATSAPP = '+971586057772';

const CARD_GRADIENT = ['#0E4741', '#0B3A35', '#082925'] as const;
const CTA_GRADIENT = ['#fb923c', '#f97316'] as const;
const ACCENT = '#fdba74';
const WATERMARK = '#fb923c';

const AUTOPLAY_DELAY_MS = 4500;
const RESUME_AFTER_INTERACTION_MS = 6000;
const SIDE_PADDING = 20;

/* ── Decorative watermark graphics (the "cookie" in the reference). ──────── */
function SunWatermark({ size = 170, color = WATERMARK }: { size?: number; color?: string }) {
  const rays: [number, number, number, number][] = [
    [50, 6, 50, 18], [50, 82, 50, 94], [6, 50, 18, 50], [82, 50, 94, 50],
    [18, 18, 27, 27], [73, 73, 82, 82], [82, 18, 73, 27], [18, 82, 27, 73],
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="20" fill={color} />
      {rays.map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={7} strokeLinecap="round" />
      ))}
    </Svg>
  );
}

function HouseWatermark({ size = 170, color = WATERMARK }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
      <Path
        fillRule="evenodd"
        d="M50 12 L88 46 L82 46 L82 88 L18 88 L18 46 L12 46 Z M44 62 H56 V88 H44 Z M28 56 H40 V68 H28 Z M60 56 H72 V68 H60 Z"
      />
    </Svg>
  );
}

function ChatWatermark({ size = 170, color = WATERMARK }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
      <Path d="M50 14C28 14 10 29 10 48c0 8 3.4 15.4 9.2 21.2L14 90l21.6-6.4C40.8 85.5 45.3 86.6 50 86.6c22 0 40-15 40-34S72 14 50 14Z" />
    </Svg>
  );
}

type Banner = {
  key: 'summer' | 'self' | 'team';
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaIcon: keyof typeof Ionicons.glyphMap;
  Watermark: typeof SunWatermark;
  onPress: () => void;
};

function BannerCard({
  banner,
  width,
  isRTL,
}: {
  banner: Banner;
  width: number;
  isRTL: boolean;
}) {
  const { Watermark } = banner;
  return (
    <View style={{ width, paddingHorizontal: SIDE_PADDING }}>
      <Pressable onPress={banner.onPress} className="active:opacity-95">
        <LinearGradient
          colors={CARD_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, overflow: 'hidden', minHeight: 198 }}>
          {/* decorative watermark on the trailing edge */}
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', top: 0, bottom: 0, justifyContent: 'center', opacity: 0.16 },
              isRTL ? { left: -24 } : { right: -24 },
            ]}>
            <Watermark />
          </View>

          <View
            className="rounded-full px-3 py-1"
            style={{
              alignSelf: isRTL ? 'flex-end' : 'flex-start',
              backgroundColor: 'rgba(251,146,60,0.16)',
              borderWidth: 1,
              borderColor: 'rgba(251,146,60,0.32)',
            }}>
            <Text className="text-[11px] font-bold" style={{ color: ACCENT }}>
              {banner.eyebrow}
            </Text>
          </View>

          <Text
            className="text-white text-[23px] font-extrabold mt-3"
            style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.5, maxWidth: '78%' }}>
            {banner.title}
          </Text>
          <Text
            className="text-white/90 text-[13.5px] font-medium mt-1.5"
            style={{ textAlign: isRTL ? 'right' : 'left', maxWidth: '80%', lineHeight: 19 }}>
            {banner.subtitle}
          </Text>

          <Pressable
            onPress={banner.onPress}
            className="mt-4 active:opacity-90"
            style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start' }}>
            <LinearGradient
              colors={CTA_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 11,
              }}>
              <Ionicons name={banner.ctaIcon} size={15} color="#ffffff" />
              <Text className="text-white text-[13px] font-extrabold">{banner.cta}</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

/**
 * For-property-owners promo carousel shown directly under the
 * "Browse by property type" section — the mobile twin of the web OwnerBanners
 * slider. Three slides (summer daily-rent, self-serve listing, team-via-WhatsApp)
 * share one teal "summer" design. Auto-advances, pauses on interaction.
 */
export function OwnerBannersSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const { width } = useWindowDimensions();

  const listRef = useRef<FlatList<Banner>>(null);
  const indexRef = useRef(0);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openWhatsApp = () => {
    const text = encodeURIComponent(t('ownerBanners.whatsappMessage'));
    Linking.openURL(`https://wa.me/${OWNER_WHATSAPP.replace(/[^0-9]/g, '')}?text=${text}`);
  };

  const banners: Banner[] = [
    {
      key: 'summer',
      eyebrow: t('ownerBanners.summerEyebrow'),
      title: t('ownerBanners.summerTitle'),
      subtitle: t('ownerBanners.summerSubtitle'),
      cta: t('ownerBanners.summerCta'),
      ctaIcon: isRTL ? 'arrow-back' : 'arrow-forward',
      Watermark: SunWatermark,
      onPress: () => router.push('/holiday-homes' as never),
    },
    {
      key: 'self',
      eyebrow: t('ownerBanners.selfEyebrow'),
      title: t('ownerBanners.selfTitle'),
      subtitle: t('ownerBanners.selfSubtitle'),
      cta: t('ownerBanners.selfCta'),
      ctaIcon: isRTL ? 'arrow-back' : 'arrow-forward',
      Watermark: HouseWatermark,
      onPress: () =>
        router.push({ pathname: '/contact', params: { interest: 'becomeAgent' } } as never),
    },
    {
      key: 'team',
      eyebrow: t('ownerBanners.teamEyebrow'),
      title: t('ownerBanners.teamTitle'),
      subtitle: t('ownerBanners.teamSubtitle'),
      cta: t('ownerBanners.teamCta'),
      ctaIcon: 'logo-whatsapp',
      Watermark: ChatWatermark,
      onPress: openWhatsApp,
    },
  ];

  // Auto-advance. Layout is never force-flipped via I18nManager, so the scroll
  // axis stays LTR in both locales — slides advance 0 → 1 → 2 → 0 by offset.
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const next = (indexRef.current + 1) % banners.length;
      indexRef.current = next;
      setActive(next);
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
    }, AUTOPLAY_DELAY_MS);
    return () => {
      clearInterval(id);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [width, banners.length]);

  const pauseAutoplay = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_INTERACTION_MS);
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    indexRef.current = idx;
    setActive(idx);
  };

  return (
    <View className="bg-white">
      <SectionHeader title={t('ownerBanners.heading')} subtitle={t('ownerBanners.subtitle')} />

      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(b) => b.key}
        renderItem={({ item }) => <BannerCard banner={item} width={width} isRTL={isRTL} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={pauseAutoplay}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* pagination dots */}
      <View className="flex-row items-center justify-center gap-2 mt-4">
        {banners.map((b, i) => (
          <View
            key={b.key}
            style={{
              height: 8,
              width: i === active ? 22 : 8,
              borderRadius: 999,
              backgroundColor: i === active ? '#f1913d' : '#d1d5db',
            }}
          />
        ))}
      </View>
    </View>
  );
}
