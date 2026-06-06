import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import { useGuestPrivacy } from '@/hooks/use-guest-privacy';

import { SectionTitle } from './specs-grid';

export function VideoCard({ url }: { url?: string }) {
  const { t } = useTranslation();
  // The video is gated for ALL guests (not just agent listings) — they must log
  // in to watch it, matching web's PropertyVideo.
  const { isGuest, promptLogin } = useGuestPrivacy();
  if (!url) return null;

  if (isGuest) {
    return (
      <View className="px-5 mt-6">
        <SectionTitle title={t('propertyDetail.propertyVideo')} />
        <Pressable
          onPress={promptLogin}
          accessibilityRole="button"
          className="bg-secondary rounded-xl overflow-hidden h-[160px] items-center justify-center active:opacity-90">
          <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mb-1.5">
            <Ionicons name="lock-closed" size={22} color="#ffffff" />
          </View>
          <Text
            className="text-white text-[12px] font-bold uppercase"
            style={{ letterSpacing: 0.6 }}>
            {t('propertyDetail.loginToViewVideo')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const open = () => Linking.openURL(url);

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.propertyVideo')} />
      <Pressable
        onPress={open}
        className="bg-secondary rounded-xl overflow-hidden h-[160px] items-center justify-center active:opacity-90">
        <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mb-1.5">
          <Ionicons name="play" size={24} color="#ffffff" style={{ marginLeft: 2 }} />
        </View>
        <Text
          className="text-white text-[12px] font-bold uppercase"
          style={{ letterSpacing: 0.6 }}>
          {t('propertyDetail.watchVideo')}
        </Text>
      </Pressable>
    </View>
  );
}
