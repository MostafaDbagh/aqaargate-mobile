import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Text,
  View,
} from 'react-native';

import type { ListingImage } from '@/lib/api';

const W = Dimensions.get('window').width;

export function ImageGallery({ images = [] }: { images: ListingImage[] }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View className="w-full h-[280px] bg-cream items-center justify-center">
        <Text className="text-note">No Images Available</Text>
      </View>
    );
  }

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / W);
    if (newIndex !== index) setIndex(newIndex);
  };

  return (
    <View className="relative">
      <FlatList
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width: W, height: 320 }}
            contentFit="cover"
            transition={150}
          />
        )}
      />

      {/* Counter badge — top-right */}
      <View className="absolute top-4 right-4 bg-black/55 px-2.5 py-1 rounded-full">
        <Text className="text-white text-[12px] font-bold tracking-tight">
          {index + 1} / {images.length}
        </Text>
      </View>

      {/* Dots indicator — bottom-center */}
      {images.length > 1 ? (
        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
          {images.map((_, i) => (
            <View
              key={i}
              className={`h-1.5 rounded-full ${
                i === index ? 'bg-white w-5' : 'bg-white/50 w-1.5'
              }`}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
