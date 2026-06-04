import { View, type ViewStyle } from 'react-native';

import { ShimmerOverlay, SkeletonBlock } from './listing-skeleton';

const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

/** Full detail-screen placeholder (property/[id], agent/[id], projects/[id]). */
export function DetailScreenSkeleton() {
  return (
    <View className="flex-1 bg-white" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Hero image */}
      <View className="bg-line" style={{ height: 280 }} />
      <View className="px-5 pt-5">
        <SkeletonBlock style={{ width: '45%', height: 26 }} />
        <SkeletonBlock className="mt-3" style={{ width: '70%', height: 16 }} />
        {/* Quick specs row */}
        <View className="flex-row gap-3 mt-5">
          <SkeletonBlock style={{ flex: 1, height: 64, borderRadius: 12 }} />
          <SkeletonBlock style={{ flex: 1, height: 64, borderRadius: 12 }} />
          <SkeletonBlock style={{ flex: 1, height: 64, borderRadius: 12 }} />
        </View>
        <SkeletonBlock className="mt-6" style={{ width: '40%', height: 18 }} />
        <SkeletonBlock className="mt-3" style={{ width: '100%', height: 14 }} />
        <SkeletonBlock className="mt-2" style={{ width: '92%', height: 14 }} />
        <SkeletonBlock className="mt-2" style={{ width: '85%', height: 14 }} />
      </View>
      <ShimmerOverlay />
    </View>
  );
}

/** One card placeholder (agent / project list item). */
export function CardSkeleton({ height = 110 }: { height?: number }) {
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden mb-4 border border-line"
      style={[{ height }, cardShadow]}>
      <View className="flex-row items-center p-3.5" style={{ gap: 12 }}>
        <SkeletonBlock style={{ width: 64, height: 64, borderRadius: 999 }} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock style={{ width: '60%', height: 16 }} />
          <SkeletonBlock className="mt-2.5" style={{ width: '40%', height: 13 }} />
          <SkeletonBlock className="mt-2.5" style={{ width: '80%', height: 13 }} />
        </View>
      </View>
      <ShimmerOverlay />
    </View>
  );
}

/** Column of card placeholders for list screens (agents, projects). */
export function CardListSkeleton({ count = 6, height = 110 }: { count?: number; height?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} height={height} />
      ))}
    </View>
  );
}

/** A row of pill/chip placeholders (categories, cities chips). */
export function ChipsRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View
      className="flex-row px-5"
      style={{ gap: 10, position: 'relative', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock
          key={i}
          style={{ width: i === 0 ? 84 : 124, height: 46, borderRadius: 999 }}
        />
      ))}
      <ShimmerOverlay />
    </View>
  );
}

/** Grid placeholder for the home cities section (2-up tall cards). */
export function CitiesGridSkeleton() {
  return (
    <View className="px-5 flex-row flex-wrap" style={{ marginHorizontal: -6, position: 'relative', overflow: 'hidden' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} className="w-1/2 p-1.5">
          <SkeletonBlock style={{ height: 220, borderRadius: 12 }} />
        </View>
      ))}
      <ShimmerOverlay />
    </View>
  );
}
