import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBlogsInfinite } from '@/apis/hooks';
import {
  blogRouteId,
  localizeBlogTags,
  localizeBlogText,
  type Blog,
} from '@/apis/blog';
import { CardListSkeleton } from '@/components/skeletons/screen-skeletons';

export default function BlogsScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBlogsInfinite();

  const blogs = useMemo(() => (data?.pages ?? []).flatMap((p) => p.data), [data]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full active:bg-cream">
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color="#1f2937" />
        </Pressable>
        <Text
          className="flex-1 text-secondary text-[17px] font-extrabold tracking-tight"
          numberOfLines={1}
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {t('blog.title')}
        </Text>
      </View>

      <FlatList
        data={blogs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BlogCard
            blog={item}
            isRTL={isRTL}
            onPress={() => router.push(`/blogs/${blogRouteId(item, isRTL)}` as never)}
          />
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          isLoading ? (
            <CardListSkeleton count={4} height={280} />
          ) : isError ? (
            <View className="py-16 items-center">
              <Ionicons name="alert-circle-outline" size={42} color="#f2695c" />
              <Text className="text-text mt-2 mb-3">{t('blog.errorLoading')}</Text>
              <Pressable onPress={() => refetch()} className="bg-primary px-5 py-2 rounded-full">
                <Text className="text-white font-semibold">{t('blog.retry')}</Text>
              </Pressable>
            </View>
          ) : (
            <View className="py-16 items-center">
              <Ionicons name="newspaper-outline" size={42} color="#a8abae" />
              <Text className="text-note mt-2">{t('blog.noBlogs')}</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator color="#f1913d" />
            </View>
          ) : null
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor="#f1913d" />
        }
      />
    </SafeAreaView>
  );
}

function BlogCard({ blog, isRTL, onPress }: { blog: Blog; isRTL: boolean; onPress: () => void }) {
  const { t } = useTranslation();
  const title = localizeBlogText(blog, 'title', isRTL);
  const excerpt = localizeBlogText(blog, 'excerpt', isRTL);
  const tags = localizeBlogTags(blog, isRTL);
  const dateLabel = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl border border-line overflow-hidden mb-4 active:opacity-95"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}>
      <View style={{ width: '100%', aspectRatio: 16 / 9, backgroundColor: '#f3f3f5' }}>
        {blog.imageSrc ? (
          <Image
            source={{ uri: blog.imageSrc }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="newspaper-outline" size={32} color="#a8abae" />
          </View>
        )}
      </View>

      <View className="p-4">
        {/* Tag · date meta */}
        <View
          className="flex-row items-center"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, flexWrap: 'wrap' }}>
          {tags.slice(0, 2).map((tag) => (
            <View key={tag} className="bg-primary-100 rounded-full px-2.5 py-0.5">
              <Text className="text-primary text-[11px] font-bold">{tag}</Text>
            </View>
          ))}
          {dateLabel ? <Text className="text-note text-[11px] font-medium">{dateLabel}</Text> : null}
        </View>

        <Text
          className="text-secondary text-[16px] font-extrabold mt-2 leading-[22px]"
          numberOfLines={2}
          style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: -0.2 }}>
          {title}
        </Text>
        {excerpt ? (
          <Text
            className="text-text text-[13px] mt-1.5 leading-[19px]"
            numberOfLines={3}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {excerpt}
          </Text>
        ) : null}

        <View
          className="flex-row items-center mt-3"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 4 }}>
          <Text className="text-primary text-[13px] font-bold">{t('blog.readMore')}</Text>
          <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={14} color="#f1913d" />
        </View>
      </View>
    </Pressable>
  );
}
