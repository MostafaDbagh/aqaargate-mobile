import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useListing } from '@/apis/hooks';
import { DetailScreenSkeleton } from '@/components/skeletons/screen-skeletons';
import { AgentCard } from '@/components/property/agent-card';
import { Amenities } from '@/components/property/amenities';
import { Description, Notes } from '@/components/property/description';
import { DetailActionBar } from '@/components/property/detail-action-bar';
import { DetailHeader } from '@/components/property/detail-header';
import { ImageGallery } from '@/components/property/image-gallery';
import { Location } from '@/components/property/location';
import { Overview } from '@/components/property/overview';
import { Reviews } from '@/components/property/reviews';
import { SimilarListings } from '@/components/property/similar-listings';
import { DetailsGrid, QuickSpecs } from '@/components/property/specs-grid';
import { VideoCard } from '@/components/property/video-card';

export default function PropertyDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, isError, refetch } = useListing(id);

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <DetailHeader listing={listing} />

      {isLoading ? (
        <DetailScreenSkeleton />
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
            contentContainerStyle={{ paddingBottom: 96 }}
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
            <Reviews listing={listing} />
            <SimilarListings current={listing} />
          </ScrollView>

          <DetailActionBar listing={listing} />
        </>
      )}
    </View>
  );
}
