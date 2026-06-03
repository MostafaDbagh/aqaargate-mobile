import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ExtendedListing } from '@/apis/listing';
import { reviewAPI, type CreateReviewPayload, type Review } from '@/apis/review';
import { useToast } from '@/components/feedback/toast';
import { CloseIcon } from '@/components/icons/svg-icons';
import { getApiErrorMessage } from '@/lib/api';
import { selectCurrentUser } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

import { SectionTitle } from './specs-grid';

const STAR_COLOR = '#f5a623';

/** Read-only star row. Half-star aware for the average. */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View className="flex-row" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name = rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half' : 'star-outline';
        return <Ionicons key={i} name={name} size={size} color={STAR_COLOR} />;
      })}
    </View>
  );
}

function reviewerName(r: Review): string {
  if (r.userId && typeof r.userId === 'object' && r.userId.username) return r.userId.username;
  return r.name || 'Anonymous';
}

function reviewerAvatar(r: Review): string | undefined {
  return r.userId && typeof r.userId === 'object' ? r.userId.avatar || undefined : undefined;
}

function initialsOf(name: string): string {
  return (
    name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A'
  );
}

export function Reviews({ listing }: { listing: ExtendedListing }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const propertyId = listing._id;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: () => reviewAPI.getByProperty(propertyId),
    enabled: !!propertyId,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / count : 0;
  const visible = showAll ? reviews : reviews.slice(0, 5);

  const countLabel =
    count === 1 ? t('reviews.reviewCountOne') : t('reviews.reviewCountMany', { n: count });

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('reviews.title')} />

      {count > 0 ? (
        /* Summary + leave-review button */
        <View
          className="bg-cream rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 12 }}>
          <View
            className="flex-row items-center"
            style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 10 }}>
            <Text className="text-secondary text-[28px] font-extrabold" style={{ letterSpacing: -0.6 }}>
              {average.toFixed(1)}
            </Text>
            <View style={{ gap: 3, alignItems: isAr ? 'flex-end' : 'flex-start' }}>
              <Stars rating={average} size={15} />
              <Text className="text-note text-[12px] font-semibold">{countLabel}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => setFormOpen(true)}
            accessibilityRole="button"
            className="flex-row items-center gap-1.5 bg-primary rounded-full px-3.5 py-2 active:opacity-90"
            style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
            <Ionicons name="create-outline" size={15} color="#ffffff" />
            <Text className="text-white text-[12px] font-bold">{t('reviews.leaveReview')}</Text>
          </Pressable>
        </View>
      ) : (
        /* Modern empty state */
        <View
          className="rounded-3xl items-center px-6 py-8 border"
          style={{ backgroundColor: '#fff9f3', borderColor: '#f4e3d2' }}>
          {/* Star badge */}
          <View
            className="w-16 h-16 rounded-full bg-white items-center justify-center mb-3.5"
            style={{
              shadowColor: '#f1913d',
              shadowOpacity: 0.22,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 7 },
              elevation: 5,
            }}>
            <Ionicons name="star" size={30} color={STAR_COLOR} />
          </View>

          {/* Decorative star row */}
          <View className="flex-row mb-3" style={{ gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={15} color="#f6cfa0" />
            ))}
          </View>

          <Text className="text-secondary text-[17px] font-extrabold" style={{ letterSpacing: -0.3 }}>
            {t('reviews.emptyTitle')}
          </Text>
          <Text
            className="text-note text-[13px] leading-[19px] mt-1.5 text-center"
            style={{ maxWidth: 280 }}>
            {t('reviews.emptySubtitle')}
          </Text>

          <Pressable
            onPress={() => setFormOpen(true)}
            accessibilityRole="button"
            className="mt-5 flex-row items-center gap-2 bg-primary rounded-full px-7 py-3 active:opacity-90"
            style={{
              flexDirection: isAr ? 'row-reverse' : 'row',
              shadowColor: '#f1913d',
              shadowOpacity: 0.32,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}>
            <Ionicons name="create-outline" size={17} color="#ffffff" />
            <Text className="text-white text-[14px] font-bold">{t('reviews.leaveReview')}</Text>
          </Pressable>
        </View>
      )}

      {/* Skeleton while loading */}
      {isLoading && count === 0 ? (
        <View className="mt-3 gap-2.5">
          {[0, 1].map((i) => (
            <View key={i} className="bg-cream rounded-2xl h-20" />
          ))}
        </View>
      ) : null}

      {/* Review list */}
      {visible.length > 0 ? (
        <View className="mt-3 gap-2.5">
          {visible.map((r) => (
            <ReviewItem key={r._id} review={r} isAr={isAr} lang={i18n.language} />
          ))}
        </View>
      ) : null}

      {/* View all / show less */}
      {count > 5 ? (
        <Pressable
          onPress={() => setShowAll((s) => !s)}
          className="mt-3 py-2.5 items-center rounded-xl border border-line active:bg-cream">
          <Text className="text-primary text-[13px] font-bold">
            {showAll ? t('reviews.showLess') : t('reviews.viewAll')}
          </Text>
        </Pressable>
      ) : null}

      <LeaveReviewModal
        visible={formOpen}
        onClose={() => setFormOpen(false)}
        propertyId={propertyId}
      />
    </View>
  );
}

function ReviewItem({ review, isAr, lang }: { review: Review; isAr: boolean; lang: string }) {
  const name = reviewerName(review);
  const avatar = reviewerAvatar(review);
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <View className="bg-white border border-line rounded-2xl p-3.5">
      <View
        className="flex-row items-center"
        style={{ flexDirection: isAr ? 'row-reverse' : 'row', gap: 10 }}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fdefe2' }}
            contentFit="cover"
            transition={150}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1913d' }}>
            <Text className="text-white text-[14px] font-extrabold">{initialsOf(name)}</Text>
          </View>
        )}
        <View className="flex-1" style={{ alignItems: isAr ? 'flex-end' : 'flex-start' }}>
          <Text
            className="text-secondary text-[14px] font-bold"
            numberOfLines={1}
            style={{ textAlign: isAr ? 'right' : 'left' }}>
            {name}
          </Text>
          {date ? <Text className="text-note text-[11px] mt-0.5">{date}</Text> : null}
        </View>
        <Stars rating={Number(review.rating) || 0} size={14} />
      </View>

      {review.review ? (
        <Text
          className="text-text text-[13px] leading-[19px] mt-2.5"
          style={{ textAlign: isAr ? 'right' : 'left' }}>
          {review.review}
        </Text>
      ) : null}
    </View>
  );
}

type Errors = { name?: string; phone?: string; email?: string; review?: string };

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isPhoneValid(v: string) {
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function LeaveReviewModal({
  visible,
  onClose,
  propertyId,
}: {
  visible: boolean;
  onClose: () => void;
  propertyId: string;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const toast = useToast();
  const qc = useQueryClient();
  const user = useAppSelector(selectCurrentUser);

  const [rating, setRating] = useState(5);
  const [name, setName] = useState(user?.username ?? '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [review, setReview] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const mutation = useMutation({ mutationFn: (p: CreateReviewPayload) => reviewAPI.create(p) });

  const clearError = (k: keyof Errors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  const onSubmit = async () => {
    const n = name.trim();
    const p = phone.trim();
    const e = email.trim();
    const r = review.trim();

    const next: Errors = {};
    if (!n) next.name = t('reviews.nameRequired');
    if (!p) next.phone = t('reviews.phoneRequired');
    else if (!isPhoneValid(p)) next.phone = t('reviews.invalidPhone');
    if (!r) next.review = t('reviews.reviewRequired');
    if (e && !isEmailValid(e)) next.email = t('reviews.invalidEmail');
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    try {
      await mutation.mutateAsync({
        propertyId,
        name: n,
        phone: p,
        email: e || undefined,
        review: r,
        rating,
        userId: user?._id,
      });
      toast.success(t('reviews.reviewSubmitted'));
      qc.invalidateQueries({ queryKey: ['reviews', propertyId] });
      setReview('');
      setErrors({});
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('reviews.reviewFailed')));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent>
      <Pressable className="flex-1 bg-black/50" onPress={onClose}>
        <View className="flex-1" />
      </Pressable>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
          <View className="items-center pt-3">
            <View className="w-10 h-1.5 rounded-full bg-gray-300" />
          </View>

          <View
            className="px-5 pt-3 pb-1 flex-row items-center justify-between"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text className="text-secondary text-lg font-bold">{t('reviews.formTitle')}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
              <CloseIcon color="#111827" />
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled">
            {/* Rating picker */}
            <FieldLabel text={t('reviews.rating')} isRTL={isRTL} />
            <View
              className="flex-row"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => setRating(i)} hitSlop={4}>
                  <Ionicons
                    name={rating >= i ? 'star' : 'star-outline'}
                    size={32}
                    color={STAR_COLOR}
                  />
                </Pressable>
              ))}
            </View>

            <FieldLabel text={t('reviews.name')} isRTL={isRTL} required />
            <TextInput
              placeholder={t('reviews.namePlaceholder')}
              placeholderTextColor="#a8abae"
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearError('name');
              }}
              className={`bg-white border rounded-xl px-3.5 py-3 text-secondary text-[15px] ${
                errors.name ? 'border-danger' : 'border-line'
              }`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />
            {errors.name ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.name}
              </Text>
            ) : null}

            <FieldLabel text={t('reviews.phone')} isRTL={isRTL} required />
            <TextInput
              placeholder={t('reviews.phonePlaceholder')}
              placeholderTextColor="#a8abae"
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                clearError('phone');
              }}
              keyboardType="phone-pad"
              className={`bg-white border rounded-xl px-3.5 py-3 text-secondary text-[15px] ${
                errors.phone ? 'border-danger' : 'border-line'
              }`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />
            {errors.phone ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.phone}
              </Text>
            ) : null}

            <FieldLabel text={t('reviews.email')} isRTL={isRTL} />
            <TextInput
              placeholder={t('reviews.emailPlaceholder')}
              placeholderTextColor="#a8abae"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              className={`bg-white border rounded-xl px-3.5 py-3 text-secondary text-[15px] ${
                errors.email ? 'border-danger' : 'border-line'
              }`}
              style={{ textAlign: isRTL ? 'right' : 'left' }}
            />
            {errors.email ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.email}
              </Text>
            ) : (
              <Text
                className="text-note text-[11px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('reviews.emailNotPublished')}
              </Text>
            )}

            <FieldLabel text={t('reviews.review')} isRTL={isRTL} required />
            <View
              className={`bg-white border rounded-xl px-3.5 ${
                errors.review ? 'border-danger' : 'border-line'
              }`}>
              <TextInput
                placeholder={t('reviews.reviewPlaceholder')}
                placeholderTextColor="#a8abae"
                value={review}
                onChangeText={(v) => {
                  setReview(v);
                  clearError('review');
                }}
                multiline
                maxLength={1000}
                className="text-secondary text-[15px]"
                style={{
                  minHeight: 110,
                  textAlignVertical: 'top',
                  textAlign: isRTL ? 'right' : 'left',
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              />
            </View>
            {errors.review ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.review}
              </Text>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`mt-5 rounded-2xl py-4 items-center ${
                mutation.isPending ? 'bg-primary/70' : 'bg-primary active:opacity-90'
              }`}>
              <Text className="text-white text-[15px] font-bold">
                {mutation.isPending ? t('reviews.submitting') : t('reviews.postReview')}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ text, isRTL, required }: { text: string; isRTL: boolean; required?: boolean }) {
  return (
    <Text
      className="text-secondary text-[13px] font-bold mt-4 mb-1.5"
      style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {text}
      {required ? <Text className="text-danger"> *</Text> : null}
    </Text>
  );
}
