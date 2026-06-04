import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCompare, useFavoriteIds, useToggleFavorite } from '@/apis/hooks';
import type { ExtendedListing } from '@/apis/listing';
import { useToast } from '@/components/feedback/toast';

const buttonShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

function RoundButton({
  name,
  onPress,
  accessibilityLabel,
  color = '#2c2e33',
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white"
      style={buttonShadow}>
      <Ionicons name={name} size={20} color={color} />
    </Pressable>
  );
}

export function DetailHeader({ listing }: { listing?: ExtendedListing }) {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { ids, isAuthed } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const [pending, setPending] = useState<boolean | null>(null);

  const favorited = listing ? (pending ?? ids.has(listing._id)) : false;

  const onHeart = () => {
    if (!listing) return;
    if (!isAuthed) {
      router.push('/(auth)/login');
      return;
    }
    const next = !favorited;
    setPending(next);
    toggleFav.mutate({ id: listing._id, favorited }, { onSettled: () => setPending(null) });
  };

  // ---- Compare (max 3) ----
  const { toggle: toggleCompare, isInCompare, max: maxCompare } = useCompare();
  const inCompare = listing ? isInCompare(listing._id) : false;
  const onCompare = () => {
    if (!listing) return;
    const res = toggleCompare(listing);
    if (res.action === 'added') toast.success(t('compare.toastAdded'));
    else if (res.action === 'removed') toast.info(t('compare.toastRemoved'));
    else toast.error(t('compare.limit', { count: maxCompare }));
  };

  return (
    <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-20 bg-transparent">
      <View className="flex-row items-center justify-between px-4 pt-2">
        <RoundButton name="chevron-back" onPress={() => router.back()} accessibilityLabel="Back" />

        {listing ? (
          <View className="flex-row items-center gap-2">
            <RoundButton
              name="git-compare"
              color={inCompare ? '#f1913d' : '#2c2e33'}
              onPress={onCompare}
              accessibilityLabel={t('compare.compare')}
            />
            <RoundButton
              name={favorited ? 'heart' : 'heart-outline'}
              color={favorited ? '#f1913d' : '#2c2e33'}
              onPress={onHeart}
              accessibilityLabel="Save"
            />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
