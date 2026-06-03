import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, type ViewStyle } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;

const cardShadow: ViewStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};

/** A light sweep that animates across its parent (which must clip overflow). */
export function ShimmerOverlay() {
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 1300, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [-SCREEN_W, SCREEN_W] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, width: SCREEN_W }}
      />
    </Animated.View>
  );
}

/** Plain grey placeholder block (rounded). */
export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string;
  style?: ViewStyle;
}) {
  return <View className={`bg-line rounded-md ${className}`} style={style} />;
}

/** One placeholder card matching the PropertyCard shape. */
export function ListingSkeletonCard() {
  return (
    <View
      className="bg-white rounded-2xl overflow-hidden mb-4 border border-line"
      style={cardShadow}>
      {/* Image placeholder (3:2) */}
      <View className="bg-line" style={{ aspectRatio: 3 / 2 }} />

      {/* Content placeholders */}
      <View className="px-4 pt-3.5 pb-3.5">
        <View className="flex-row items-center justify-between">
          <SkeletonBlock style={{ width: '40%', height: 22 }} />
          <SkeletonBlock style={{ width: 72, height: 26, borderRadius: 8 }} />
        </View>
        <SkeletonBlock className="mt-3" style={{ width: '65%', height: 16 }} />
        <View className="bg-cream rounded-xl mt-3.5" style={{ height: 48 }} />
      </View>

      {/* Sweep across the whole card */}
      <ShimmerOverlay />
    </View>
  );
}

/** A column of skeleton cards for list/grid loading states. */
export function ListingSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <ListingSkeletonCard key={i} />
      ))}
    </View>
  );
}
