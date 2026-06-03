import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { SparklesIcon, StarIcon } from '@/components/icons/svg-icons';

export type SlideIconKind = 'sparkles' | 'shield' | 'chat';

export type OnboardingSlideData = {
  key: string;
  icon: SlideIconKind;
  title: string;
  desc: string;
  chipPrimary: string;
  chipSecondary: string;
};

function CenterIcon({ kind }: { kind: SlideIconKind }) {
  if (kind === 'sparkles') return <SparklesIcon size={46} color="#ffffff" />;
  return (
    <Ionicons
      name={kind === 'shield' ? 'shield-checkmark' : 'chatbubbles'}
      size={46}
      color="#ffffff"
    />
  );
}

/**
 * One full-screen onboarding slide: an asset-free "app preview" illustration
 * (icon badge + floating chips on a soft card) above a centered title + blurb.
 * Fills its parent — the screen sizes each page wrapper to one screen width.
 */
export function OnboardingSlide({
  data,
  isRTL,
}: {
  data: OnboardingSlideData;
  isRTL: boolean;
}) {
  const lead = isRTL ? 'right' : 'left';
  const trail = isRTL ? 'left' : 'right';

  return (
    <View className="flex-1 px-7 pt-2">
      {/* ── Illustration ─────────────────────────────────────────── */}
      <View className="flex-[1.3] w-full items-center justify-center">
        {/* Brand glow behind the card */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: 300,
            backgroundColor: 'rgba(241, 145, 61, 0.12)',
          }}
        />

        <View
          className="rounded-[36px] overflow-hidden border border-line bg-white"
          style={{
            width: '80%',
            aspectRatio: 0.74,
            shadowColor: '#2c2e33',
            shadowOpacity: 0.12,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 14 },
            elevation: 8,
          }}>
          <LinearGradient
            colors={['#fef7f1', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Center icon badge */}
          <View className="flex-1 items-center justify-center">
            <View
              className="w-24 h-24 rounded-[28px] bg-primary items-center justify-center"
              style={{
                shadowColor: '#f1913d',
                shadowOpacity: 0.45,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 10 },
                elevation: 8,
              }}>
              <CenterIcon kind={data.icon} />
            </View>
          </View>

          {/* Floating chip — top (light pill, leading side) */}
          <View
            className="absolute flex-row items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-line"
            style={{
              top: 26,
              [lead]: 18,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              shadowColor: '#2c2e33',
              shadowOpacity: 0.1,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}>
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
            <Text className="text-secondary text-[11px] font-bold">{data.chipPrimary}</Text>
          </View>

          {/* Floating chip — bottom (dark pill, trailing side) */}
          <View
            className="absolute flex-row items-center gap-1.5 bg-secondary rounded-full px-3 py-1.5"
            style={{
              bottom: 26,
              [trail]: 18,
              flexDirection: isRTL ? 'row-reverse' : 'row',
              shadowColor: '#2c2e33',
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}>
            <StarIcon size={11} color="#f1913d" />
            <Text className="text-white text-[11px] font-bold">{data.chipSecondary}</Text>
          </View>
        </View>
      </View>

      {/* ── Copy ─────────────────────────────────────────────────── */}
      <View className="flex-1 w-full items-center pt-3">
        <Text
          className="text-secondary text-[26px] font-extrabold leading-[34px]"
          style={{ textAlign: 'center' }}>
          {data.title}
        </Text>
        <Text
          className="text-text text-[15px] leading-[23px] mt-3 px-2"
          style={{ textAlign: 'center', maxWidth: 340 }}>
          {data.desc}
        </Text>
      </View>
    </View>
  );
}
