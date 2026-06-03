import { useMutation } from '@tanstack/react-query';
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
import { messageAPI, type MessagePayload } from '@/apis/message';
import { useToast } from '@/components/feedback/toast';
import { PhoneInput } from '@/components/forms/phone-input';
import { CloseIcon } from '@/components/icons/svg-icons';
import { getApiErrorMessage } from '@/lib/api';
import { selectCurrentUser } from '@/store/selectors';
import { useAppSelector } from '@/store/store';

/** Pull the agent's id out of a listing whose agentId may be a string or a populated object. */
function resolveAgentId(listing: ExtendedListing): string {
  const a = listing.agentId;
  if (a && typeof a === 'object') return a._id ?? '';
  if (typeof a === 'string') return a;
  if (typeof listing.agent === 'string') return listing.agent;
  return '';
}

type Errors = { name?: string; phone?: string; email?: string; message?: string };

export function MessageAgentModal({
  visible,
  onClose,
  listing,
}: {
  visible: boolean;
  onClose: () => void;
  listing: ExtendedListing;
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const toast = useToast();
  const user = useAppSelector(selectCurrentUser);

  const [name, setName] = useState(user?.username ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const mutation = useMutation({ mutationFn: (p: MessagePayload) => messageAPI.send(p) });

  const clearError = (k: keyof Errors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  const onSubmit = async () => {
    const n = name.trim();
    const ph = phone.trim();
    const em = email.trim();
    const msg = message.trim();

    const next: Errors = {};
    if (!n) next.name = t('propertyDetail.messageNameRequired');
    if (!ph) next.phone = t('propertyDetail.messagePhoneRequired');
    else if (ph.replace(/\D/g, '').length < 6) next.phone = t('propertyDetail.messageInvalidPhone');
    // Email is optional — only validate the format when something is entered.
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) next.email = t('propertyDetail.messageInvalidEmail');
    if (!msg) next.message = t('propertyDetail.messageRequired');
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const subject = `Contact Agent - ${listing.propertyKeyword ?? listing.propertyType ?? 'Property'}`;

    try {
      const res = await mutation.mutateAsync({
        propertyId: listing._id,
        agentId: resolveAgentId(listing),
        senderName: n,
        senderEmail: em || user?.email || 'user@example.com',
        senderPhone: ph,
        subject,
        message: msg,
        messageType: 'inquiry',
      });

      if (res?.success === false) {
        toast.error(res.message || res.error || t('propertyDetail.messageErrorTitle'));
        return;
      }

      toast.success(t('propertyDetail.messageSentSuccess'));
      setMessage('');
      setErrors({});
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('propertyDetail.messageErrorTitle')));
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
            <Text className="text-secondary text-lg font-bold">
              {t('propertyDetail.messageFormTitle')}
            </Text>
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
            <FieldLabel text={t('propertyDetail.messageName')} isRTL={isRTL} />
            <TextInput
              placeholder={t('propertyDetail.messageNamePlaceholder')}
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

            <FieldLabel text={t('propertyDetail.messagePhone')} isRTL={isRTL} />
            <PhoneInput
              placeholder={t('propertyDetail.messagePhonePlaceholder')}
              value={phone}
              onChange={(v) => {
                setPhone(v);
                clearError('phone');
              }}
              error={!!errors.phone}
              errorText={errors.phone}
            />

            <FieldLabel
              text={t('propertyDetail.messageEmail')}
              isRTL={isRTL}
              optional
              optionalText={t('propertyDetail.messageOptional')}
            />
            <TextInput
              placeholder={t('propertyDetail.messageEmailPlaceholder')}
              placeholderTextColor="#a8abae"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                clearError('email');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
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
            ) : null}

            <FieldLabel text={t('propertyDetail.messageMessage')} isRTL={isRTL} />
            <View className={`bg-white border rounded-xl px-3.5 ${errors.message ? 'border-danger' : 'border-line'}`}>
              <TextInput
                placeholder={t('propertyDetail.messagePlaceholder')}
                placeholderTextColor="#a8abae"
                value={message}
                onChangeText={(v) => {
                  setMessage(v);
                  clearError('message');
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
              className={`mt-5 rounded-2xl py-4 items-center ${
                mutation.isPending ? 'bg-primary/70' : 'bg-primary active:opacity-90'
              }`}>
              <Text className="text-white text-[15px] font-bold">
                {mutation.isPending
                  ? t('propertyDetail.messageSending')
                  : t('propertyDetail.messageSubmit')}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({
  text,
  isRTL,
  optional = false,
  optionalText,
}: {
  text: string;
  isRTL: boolean;
  optional?: boolean;
  optionalText?: string;
}) {
  return (
    <Text
      className="text-secondary text-[13px] font-bold mt-4 mb-1.5"
      style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {text}
      {optional ? (
        <Text className="text-note font-medium"> ({optionalText})</Text>
      ) : (
        <Text className="text-danger"> *</Text>
      )}
    </Text>
  );
}
