import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { contactAPI, type ContactPayload } from '@/apis/contact';
import { useToast } from '@/components/feedback/toast';
import { CloseIcon } from '@/components/icons/svg-icons';
import { getApiErrorMessage } from '@/lib/api';

const INTEREST_KEYS = [
  'rent',
  'sale',
  'job',
  'futureBuyer',
  'rentalService',
  'becomeAgent',
  'vip',
  'complain',
  'query',
  'location',
] as const;

type InterestKey = (typeof INTEREST_KEYS)[number];

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
};

const PHONE_E164 = '+971586057772';
const PHONE_SY = '+963980184112';
const EMAIL = 'contact@aqaargate.com';

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function ContactScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const toast = useToast();
  const params = useLocalSearchParams<{ interest?: string }>();

  const initialInterest = (params.interest && INTEREST_KEYS.includes(params.interest as InterestKey)
    ? (params.interest as InterestKey)
    : null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState<InterestKey | ''>(initialInterest ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: ContactPayload) => contactAPI.createContact(payload),
  });

  const clearError = (k: keyof FieldErrors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  const onSubmit = async () => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) next.name = t('contact.errors.nameRequired');
    if (!trimmedPhone) next.phone = t('contact.errors.phoneRequired');
    if (!interest) next.interest = t('contact.errors.interestRequired');
    if (!trimmedMessage) next.message = t('contact.errors.messageRequired');
    if (trimmedEmail && !isEmailValid(trimmedEmail))
      next.email = t('contact.errors.emailInvalid');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        name: trimmedName,
        email: trimmedEmail || undefined,
        phone: trimmedPhone,
        interest: interest ? t(`contact.${interest}`) : 'General Inquiry',
        message: trimmedMessage,
      });

      if (result.success) {
        toast.success(t('contact.successBody'));
        setName('');
        setEmail('');
        setPhone('');
        setInterest('');
        setMessage('');
        setErrors({});
      } else {
        toast.error(result.message || t('contact.errorTitle'));
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: string; message?: string; retryAfter?: number } };
        error?: string;
      };
      const code = e?.error || e?.response?.data?.error;
      if (code === 'RATE_LIMIT_EXCEEDED') {
        const retryAfter = e?.response?.data?.retryAfter ?? 900;
        const minutes = Math.ceil(retryAfter / 60);
        toast.error(t('contact.rateLimited', { minutes }));
      } else {
        toast.error(getApiErrorMessage(err, t('contact.errorTitle')));
      }
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className="px-4 pt-2 pb-3 bg-white border-b border-line"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-cream">
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color="#1f2937"
          />
        </Pressable>
        <View className="flex-1 px-2">
          <Text
            className="text-secondary text-[17px] font-extrabold tracking-tight"
            numberOfLines={1}
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('contact.headerTitle')}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled">
          {/* Heading */}
          <View className="px-5 pt-6">
            <Text
              className="text-secondary text-[24px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('contact.title')}
            </Text>
            <Text
              className="text-text text-[13px] mt-2 leading-[20px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('contact.subtitle')}
            </Text>
          </View>

          {/* Form */}
          <View className="px-5 mt-6">
            <FieldLabel text={t('contact.name')} required isRTL={isRTL} />
            <Input
              placeholder={t('contact.namePlaceholder')}
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearError('name');
              }}
              error={errors.name}
              isRTL={isRTL}
            />

            <FieldLabel text={t('contact.email')} isRTL={isRTL} />
            <Input
              placeholder={t('contact.emailPlaceholder')}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              isRTL={isRTL}
            />

            <FieldLabel text={t('contact.phoneNumber')} required isRTL={isRTL} />
            <Input
              placeholder={t('contact.phonePlaceholder')}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                clearError('phone');
              }}
              keyboardType="phone-pad"
              error={errors.phone}
              isRTL={isRTL}
            />

            <FieldLabel text={t('contact.interestedIn')} required isRTL={isRTL} />
            <Pressable
              onPress={() => {
                setPickerOpen(true);
                clearError('interest');
              }}
              className={`flex-row items-center justify-between bg-white border rounded-xl px-3.5 py-3 ${
                errors.interest ? 'border-danger' : 'border-line active:bg-cream'
              }`}
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Text
                className={`text-[15px] ${
                  interest ? 'text-secondary font-semibold' : 'text-note'
                }`}>
                {interest ? t(`contact.${interest}`) : t('contact.selectOption')}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#5c5e61" />
            </Pressable>
            {errors.interest ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.interest}
              </Text>
            ) : null}

            <FieldLabel text={t('contact.yourMessage')} required isRTL={isRTL} />
            <View
              className={`bg-white border rounded-xl px-3.5 ${
                errors.message ? 'border-danger' : 'border-line'
              }`}>
              <TextInput
                placeholder={t('contact.messagePlaceholder')}
                placeholderTextColor="#a8abae"
                value={message}
                onChangeText={(v) => {
                  setMessage(v);
                  clearError('message');
                }}
                multiline
                numberOfLines={6}
                className="text-secondary text-[15px]"
                style={{
                  minHeight: 140,
                  textAlignVertical: 'top',
                  textAlign: isRTL ? 'right' : 'left',
                  paddingTop: 12,
                  paddingBottom: 12,
                }}
              />
            </View>
            {errors.message ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.message}
              </Text>
            ) : null}

            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`mt-6 rounded-2xl py-4 items-center ${
                mutation.isPending ? 'bg-primary/70' : 'bg-primary active:opacity-90'
              }`}>
              <Text className="text-white text-[15px] font-bold">
                {mutation.isPending ? t('contact.sending') : t('contact.contactExperts')}
              </Text>
            </Pressable>
          </View>

          {/* About / contact info */}
          <View className="mt-10 px-5 pt-6 pb-2 border-t border-line">
            <Text
              className="text-secondary text-[20px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('contact.about.title')}
            </Text>
            <Text
              className="text-text text-[13px] mt-2 leading-[20px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('contact.about.subtitle')}
            </Text>

            <View className="mt-5 gap-3">
              <InfoRow
                icon="location-outline"
                label={t('contact.about.officeAddress')}
                value={t('contact.about.officeLocation')}
                isRTL={isRTL}
              />
              <InfoRow
                icon="logo-whatsapp"
                label={t('contact.about.whatsappNumberLabel')}
                value={PHONE_E164}
                onPress={() =>
                  Linking.openURL(`https://wa.me/${PHONE_E164.replace(/[^0-9]/g, '')}`)
                }
                isRTL={isRTL}
              />
              <InfoRow
                icon="call-outline"
                label={t('contact.about.phoneNumberLabel')}
                value={PHONE_SY}
                onPress={() => Linking.openURL(`tel:${PHONE_SY}`)}
                isRTL={isRTL}
              />
              <InfoRow
                icon="mail-outline"
                label={t('contact.about.emailAddressLabel')}
                value={EMAIL}
                onPress={() => Linking.openURL(`mailto:${EMAIL}`)}
                isRTL={isRTL}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Interest picker */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
        statusBarTranslucent>
        <Pressable className="flex-1 bg-black/50" onPress={() => setPickerOpen(false)}>
          <View className="flex-1" />
        </Pressable>
        <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
          <View className="items-center pt-3">
            <View className="w-10 h-1.5 rounded-full bg-gray-300" />
          </View>
          <View
            className="px-5 pt-3 pb-3 flex-row items-center justify-between"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Text className="text-brand text-lg font-bold">
              {t('contact.interestedIn')}
            </Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              hitSlop={10}
              className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
              <CloseIcon color="#111827" />
            </Pressable>
          </View>
          <ScrollView className="px-3 pb-3" style={{ maxHeight: 420 }}>
            {INTEREST_KEYS.map((key) => {
              const active = interest === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setInterest(key);
                    setPickerOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-3 py-3.5 rounded-xl ${
                    active ? 'bg-primary-50' : 'active:bg-cream'
                  }`}
                  style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <Text
                    className={`text-[15px] font-semibold ${
                      active ? 'text-primary' : 'text-secondary'
                    }`}>
                    {t(`contact.${key}`)}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={20} color="#f1913d" />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function FieldLabel({
  text,
  required,
  isRTL,
}: {
  text: string;
  required?: boolean;
  isRTL: boolean;
}) {
  return (
    <Text
      className="text-secondary text-[13px] font-bold mt-4 mb-1.5"
      style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {text}
      {required ? <Text className="text-danger"> *</Text> : null}
    </Text>
  );
}

function Input({
  placeholder,
  value,
  onChangeText,
  error,
  isRTL,
  keyboardType,
  autoCapitalize,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  isRTL: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#a8abae"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`bg-white border rounded-xl px-3.5 py-3 text-secondary text-[15px] ${
          error ? 'border-danger' : 'border-line'
        }`}
        style={{ textAlign: isRTL ? 'right' : 'left' }}
      />
      {error ? (
        <Text
          className="text-danger text-[12px] mt-1"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function InfoRow({
  icon,
  iconColor = '#5c5e61',
  label,
  value,
  onPress,
  isRTL,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label: string;
  value: string;
  onPress?: () => void;
  isRTL: boolean;
}) {
  const Content = (
    <View
      className="flex-row items-center gap-3 bg-cream/40 border border-line rounded-2xl px-4 py-3"
      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <View className="w-10 h-10 rounded-full bg-white items-center justify-center border border-line">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className="text-note text-[11px] font-semibold uppercase"
          style={{ textAlign: isRTL ? 'right' : 'left', letterSpacing: 1 }}>
          {label}
        </Text>
        <Text
          className="text-secondary text-[14px] font-semibold mt-0.5"
          numberOfLines={1}
          style={{
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: 'ltr',
          }}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (!onPress) return Content;
  return (
    <Pressable onPress={onPress} className="active:opacity-80">
      {Content}
    </Pressable>
  );
}
