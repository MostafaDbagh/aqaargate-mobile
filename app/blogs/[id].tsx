import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBlog } from '@/apis/hooks';
import { localizeBlogTags, localizeBlogText } from '@/apis/blog';
import { SkeletonBlock } from '@/components/skeletons/listing-skeleton';
import { htmlToParagraphs } from '@/lib/html-text';

export default function BlogDetailScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: blog, isLoading, isError, refetch } = useBlog(id);

  const title = localizeBlogText(blog, 'title', isRTL);
  const tags = localizeBlogTags(blog, isRTL);
  const paragraphs = useMemo(
    () => htmlToParagraphs(localizeBlogText(blog, 'content', isRTL)),
    [blog, isRTL]
  );
  const author = (isRTL && blog?.author?.name_ar) || blog?.author?.name || '';
  const dateLabel = blog?.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <View className="flex-1 bg-white">
      {/* Floating back button over the hero */}
      <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 z-20">
        <View className="px-4 pt-2" style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('blog.backToBlog')}
            className="w-10 h-10 rounded-full bg-white/90 items-center justify-center active:bg-white"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.12,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={20} color="#2c2e33" />
          </Pressable>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1">
          <SkeletonBlock style={{ width: '100%', height: 260 }} />
          <View className="px-5 mt-5">
            <SkeletonBlock style={{ width: '80%', height: 24, borderRadius: 8 }} />
            <SkeletonBlock style={{ width: '50%', height: 14, borderRadius: 6, marginTop: 12 }} />
            <SkeletonBlock style={{ width: '100%', height: 14, borderRadius: 6, marginTop: 20 }} />
            <SkeletonBlock style={{ width: '100%', height: 14, borderRadius: 6, marginTop: 8 }} />
            <SkeletonBlock style={{ width: '92%', height: 14, borderRadius: 6, marginTop: 8 }} />
          </View>
        </View>
      ) : isError || !blog ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={42} color="#f2695c" />
          <Text className="text-text mt-2 mb-3 text-center">{t('blog.notFound')}</Text>
          <Pressable onPress={() => refetch()} className="bg-primary px-5 py-2.5 rounded-full">
            <Text className="text-white font-semibold">{t('blog.retry')}</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
          {/* Cover */}
          <View style={{ width: '100%', aspectRatio: 16 / 10, backgroundColor: '#f3f3f5' }}>
            {blog.imageSrc ? (
              <Image
                source={{ uri: blog.imageSrc }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={180}
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="newspaper-outline" size={40} color="#a8abae" />
              </View>
            )}
          </View>

          <View className="px-5 pt-5">
            {/* Tags */}
            {tags.length > 0 ? (
              <View
                className="flex-row items-center mb-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <View key={tag} className="bg-primary-100 rounded-full px-3 py-1">
                    <Text className="text-primary text-[11px] font-bold">{tag}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text
              className="text-secondary text-[24px] font-extrabold leading-[32px]"
              style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.4 }}>
              {title}
            </Text>

            {/* Meta */}
            {author || dateLabel ? (
              <View
                className="flex-row items-center mt-3"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6 }}>
                <Ionicons name="person-circle-outline" size={16} color="#a8abae" />
                <Text className="text-note text-[12px] font-medium">
                  {[author && `${t('blog.by')} ${author}`, dateLabel].filter(Boolean).join('  ·  ')}
                </Text>
              </View>
            ) : null}

            <View className="border-t border-line my-4" />

            {/* Body */}
            {paragraphs.map((para, idx) => (
              <Text
                key={idx}
                className="text-text text-[15px] mb-3.5"
                style={{ textAlign: isRTL ? 'right' : 'left', lineHeight: 25 }}>
                {para}
              </Text>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
