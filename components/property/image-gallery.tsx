import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ListingImage } from '@/lib/api';

const { width: W, height: H } = Dimensions.get('window');
const THUMB = 60;
const THUMB_GAP = 8;

export function ImageGallery({ images = [] }: { images: ListingImage[] }) {
  const [index, setIndex] = useState(0);
  // null = lightbox closed; otherwise the index the viewer should open at.
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

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
        renderItem={({ item, index: i }) => (
          <Pressable onPress={() => setViewerIndex(i)}>
            <Image
              source={{ uri: item.url }}
              style={{ width: W, height: 320 }}
              contentFit="cover"
              transition={150}
            />
          </Pressable>
        )}
      />

      {/* Tap-to-expand hint — bottom-left (clear of the header buttons, counter, and dots) */}
      <Pressable
        onPress={() => setViewerIndex(index)}
        hitSlop={8}
        className="absolute bottom-3 left-4 bg-black/55 w-9 h-9 rounded-full items-center justify-center">
        <Ionicons name="expand" size={18} color="#ffffff" />
      </Pressable>

      {/* Counter badge — bottom-right (clear of the status bar + header buttons) */}
      <View className="absolute bottom-3 right-4 bg-black/55 px-2.5 py-1 rounded-full">
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

      {/* Fullscreen lightbox — mounted only while open so it always opens at the tapped image */}
      {viewerIndex != null ? (
        <Lightbox
          images={images}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </View>
  );
}

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: ListingImage[];
  startIndex: number;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(startIndex);
  const pagerRef = useRef<FlatList<ListingImage>>(null);
  const thumbRef = useRef<FlatList<ListingImage>>(null);

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(images.length - 1, i));
    setActive(next);
    pagerRef.current?.scrollToIndex({ index: next, animated: true });
    thumbRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0.5 });
  };

  const onPagerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / W);
    if (i !== active) {
      setActive(i);
      thumbRef.current?.scrollToIndex({ index: i, animated: true, viewPosition: 0.5 });
    }
  };

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Full-size, swipeable pager */}
        <FlatList
          ref={pagerRef}
          data={images}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
          onScrollToIndexFailed={() => {}}
          onMomentumScrollEnd={onPagerEnd}
          renderItem={({ item }) => (
            <View style={{ width: W, height: H, alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: W, height: H * 0.72 }}
                contentFit="contain"
                transition={150}
              />
            </View>
          )}
        />

        {/* Top bar: counter + close */}
        <View
          style={{
            position: 'absolute',
            top: insets.top + 8,
            left: 16,
            right: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View className="bg-white/15 px-3 py-1 rounded-full">
            <Text className="text-white text-[13px] font-bold">
              {active + 1} / {images.length}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="bg-white/15 w-9 h-9 rounded-full items-center justify-center">
            <Ionicons name="close" size={22} color="#ffffff" />
          </Pressable>
        </View>

        {/* Prev / next arrows */}
        {images.length > 1 ? (
          <>
            <Pressable
              onPress={() => goTo(active - 1)}
              hitSlop={8}
              disabled={active === 0}
              style={{ position: 'absolute', left: 10, top: H / 2 - 24, opacity: active === 0 ? 0.3 : 1 }}
              className="bg-white/15 w-12 h-12 rounded-full items-center justify-center">
              <Ionicons name="chevron-back" size={26} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => goTo(active + 1)}
              hitSlop={8}
              disabled={active === images.length - 1}
              style={{
                position: 'absolute',
                right: 10,
                top: H / 2 - 24,
                opacity: active === images.length - 1 ? 0.3 : 1,
              }}
              className="bg-white/15 w-12 h-12 rounded-full items-center justify-center">
              <Ionicons name="chevron-forward" size={26} color="#ffffff" />
            </Pressable>
          </>
        ) : null}

        {/* Thumbnail strip */}
        {images.length > 1 ? (
          <View style={{ position: 'absolute', bottom: insets.bottom + 14, left: 0, right: 0 }}>
            <FlatList
              ref={thumbRef}
              data={images}
              keyExtractor={(_, i) => `t${i}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, gap: THUMB_GAP }}
              initialScrollIndex={startIndex}
              getItemLayout={(_, i) => ({
                length: THUMB + THUMB_GAP,
                offset: (THUMB + THUMB_GAP) * i,
                index: i,
              })}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item, index: i }) => (
                <Pressable onPress={() => goTo(i)}>
                  <Image
                    source={{ uri: item.url }}
                    style={{
                      width: THUMB,
                      height: THUMB,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: i === active ? '#f1913d' : 'transparent',
                      opacity: i === active ? 1 : 0.55,
                    }}
                    contentFit="cover"
                  />
                </Pressable>
              )}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
