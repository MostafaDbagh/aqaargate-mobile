import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useListing } from '@/apis/hooks';
import { AgentCard } from '@/components/property/agent-card';
import { Amenities } from '@/components/property/amenities';
import { Description, Notes } from '@/components/property/description';
import { ImageGallery } from '@/components/property/image-gallery';
import { Location } from '@/components/property/location';
import { Overview } from '@/components/property/overview';
import { SimilarListings } from '@/components/property/similar-listings';
import { DetailsGrid, QuickSpecs } from '@/components/property/specs-grid';
import { StickyCta } from '@/components/property/sticky-cta';
import { VideoCard } from '@/components/property/video-card';

export default function PropertyDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, isError, refetch } = useListing(id);

  const onShare = async () => {
    if (!listing) return;
    const url = `https://aqaargate.com/property-detail/${listing._id}`;
    await Share.share({
      message: `${listing.propertyKeyword ?? listing.propertyType ?? 'Property'} — ${url}`,
      url,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <View className="flex-row items-center justify-between px-4 pt-2">
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Back"
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white">
            <Ionicons name="chevron-back" size={22} color="#2c2e33" />
          </Pressable>
          <Pressable
            onPress={onShare}
            accessibilityLabel="Share"
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white">
            <Ionicons name="share-outline" size={20} color="#2c2e33" />
          </Pressable>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f1913d" />
        </View>
      ) : isError || !listing ? (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-text mb-3">{t('propertyDetail.error')}</Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-primary px-5 py-2.5 rounded-full">
            <Text className="text-white font-semibold">{t('properties.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}>
            <ImageGallery images={listing.images ?? []} />
            <Overview listing={listing} />
            <QuickSpecs listing={listing} />
            <Description desc={listing.propertyDesc} descAr={listing.description_ar} />
            <Notes notes={listing.notes} notesAr={listing.notes_ar} />
            <DetailsGrid listing={listing} />
            <Amenities amenities={listing.amenities ?? []} />
            <Location listing={listing} />
            <VideoCard url={listing.videoUrl} />
            <AgentCard listing={listing} />
            <SimilarListings current={listing} />
          </ScrollView>

          <StickyCta listing={listing} />
        </>
      )}
    </View>
  );
}
