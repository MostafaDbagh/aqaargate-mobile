import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export type SlideIconKind = 'sparkles' | 'shield' | 'chat';

export type OnboardingSlideData = {
  key: string;
  icon: SlideIconKind;
  /** Real Syrian city photo for the photo slides (null until it streams in). */
  image?: string | null;
  /** When true the hero shows the AqaarGate logo instead of a city photo. */
  useLogo?: boolean;
  title: string;
  desc: string;
};

type GlyphName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Themed glyph per slide — the only decoration; everything else is real. */
const GLYPH: Record<SlideIconKind, GlyphName> = {
  sparkles: 'star-four-points',
  shield: 'shield-check-outline',
  chat: 'chat-outline',
};

/** Soft warm blur shown while a hero photo streams in (and if it's missing). */
const BLUR_PLACEHOLDER = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

/** Shared hero-card frame so the photo and logo slides line up identically. */
const cardStyle = {
  width: '80%',
  // Less tall than a full portrait card — the hero photo was overflowing the
  // available height. Height ≈ cardWidth / aspectRatio, so a larger ratio = shorter card.
  aspectRatio: 0.95,
  shadowColor: '#2c2e33',
  shadowOpacity: 0.16,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 16 },
  elevation: 10,
} as const;

/**
 * One onboarding slide. Photo slides show a real Syrian city image (no
 * fabricated stats/reviews/prices); the agents slide shows the AqaarGate logo
 * instead of an unrelated cityscape. Below the hero, the slide's themed icon
 * sits on the same row as the title, with the description underneath.
 * Fills its parent — the screen sizes each page wrapper to one screen width.
 */
export function OnboardingSlide({
  data,
  isRTL,
}: {
  data: OnboardingSlideData;
  isRTL: boolean;
}) {
  return (
    <View className="flex-1 px-7 pt-2">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <View className="flex-[1.3] w-full items-center justify-center">
        {/* Soft brand glow behind the card */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: 300,
            backgroundColor: 'rgba(241, 145, 61, 0.14)',
          }}
        />

        {data.useLogo ? (
          /* Brand-logo hero (agents slide) */
          <View
            className="rounded-[36px] overflow-hidden border border-line items-center justify-center"
            style={cardStyle}>
            <LinearGradient
              colors={['#fff7ef', '#ffffff', '#fdf1e4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image
              source={require('../../assets/images/brand-logo.png')}
              style={{ width: '74%', aspectRatio: 276 / 96 }}
              contentFit="contain"
            />
          </View>
        ) : (
          /* Real Syrian city photo hero — no fabricated overlay chips */
          <View
            className="rounded-[36px] overflow-hidden border border-line bg-cream"
            style={cardStyle}>
            <Image
              source={data.image ? { uri: data.image } : undefined}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={350}
              placeholder={BLUR_PLACEHOLDER}
              cachePolicy="memory-disk"
            />
            {/* Subtle vignette so the photo sits gracefully inside the card */}
            <LinearGradient
              colors={['rgba(20,18,16,0.10)', 'rgba(20,18,16,0)', 'rgba(20,18,16,0.20)']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </View>

      {/* ── Copy: icon + title on one row, description below ──────── */}
      <View
        className="flex-1 w-full pt-8"
        style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
        <View
          className="flex-row items-center"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 12 }}>
          <View
            className="items-center justify-center"
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: 'rgba(241, 145, 61, 0.12)',
            }}>
            <MaterialCommunityIcons name={GLYPH[data.icon]} size={24} color="#f1913d" />
          </View>
          <Text
            className="text-secondary text-[24px] font-extrabold leading-[31px] flex-1"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {data.title}
          </Text>
        </View>

        <Text
          className="text-text text-[15px] leading-[24px] mt-5"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {data.desc}
        </Text>
      </View>
    </View>
  );
}
