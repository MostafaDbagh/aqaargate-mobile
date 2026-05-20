import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import { SectionTitle } from './specs-grid';

export function VideoCard({ url }: { url?: string }) {
  const { t } = useTranslation();
  if (!url) return null;

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
