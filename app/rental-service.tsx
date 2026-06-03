import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
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

import {
  propertyRentalAPI,
  type PropertyRentalPayload,
  type PropertyRentalType,
} from '@/apis/propertyRental';
import { useToast } from '@/components/feedback/toast';
import { PhoneInput } from '@/components/forms/phone-input';
import { CloseIcon } from '@/components/icons/svg-icons';
import { getApiErrorMessage } from '@/lib/api';

const PROPERTY_TYPES: PropertyRentalType[] = [
  'apartment',
  'villa',
  'house',
  'land',
  'commercial',
  'office',
  'shop',
  'other',
];

type FieldErrors = Partial<{
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  propertyType: string;
  propertySize: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  features: string;
}>;

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function RentalServiceScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyRentalType | ''>('');
  const [propertySize, setPropertySize] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [location, setLocation] = useState('');
  const [features, setFeatures] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: PropertyRentalPayload) =>
      propertyRentalAPI.createPropertyRentalRequest(payload),
  });

  const clearError = (k: keyof FieldErrors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  const onSubmit = async () => {
    const next: FieldErrors = {};
    const trimmedName = ownerName.trim();
    const trimmedEmail = ownerEmail.trim();
    const trimmedPhone = ownerPhone.trim();
    const trimmedLocation = location.trim();
    const trimmedFeatures = features.trim();
    const sizeNum = parseInt(propertySize, 10);
    const bedroomsNum = parseInt(bedrooms, 10);
    const bathroomsNum = parseInt(bathrooms, 10);

    if (!trimmedName) next.ownerName = t('rentalService.errors.ownerNameRequired');
    if (!trimmedEmail) next.ownerEmail = t('rentalService.errors.ownerEmailRequired');
    else if (!isEmailValid(trimmedEmail))
      next.ownerEmail = t('rentalService.errors.ownerEmailInvalid');
    if (!trimmedPhone) next.ownerPhone = t('rentalService.errors.ownerPhoneRequired');
    if (!propertyType) next.propertyType = t('rentalService.errors.propertyTypeRequired');
    if (!propertySize) next.propertySize = t('rentalService.errors.propertySizeRequired');
    else if (Number.isNaN(sizeNum) || sizeNum <= 0)
      next.propertySize = t('rentalService.errors.propertySizeInvalid');
    if (!bedrooms || Number.isNaN(bedroomsNum))
      next.bedrooms = t('rentalService.errors.bedroomsRequired');
    if (!bathrooms || Number.isNaN(bathroomsNum))
      next.bathrooms = t('rentalService.errors.bathroomsRequired');
    if (!trimmedLocation) next.location = t('rentalService.errors.locationRequired');
    if (!trimmedFeatures) next.features = t('rentalService.errors.featuresRequired');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        ownerName: trimmedName,
        ownerEmail: trimmedEmail,
        ownerPhone: trimmedPhone,
        propertyType: propertyType as PropertyRentalType,
        propertySize: sizeNum,
        bedrooms: bedroomsNum,
        bathrooms: bathroomsNum,
        location: trimmedLocation,
        features: trimmedFeatures,
        additionalDetails: additionalDetails.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message || t('rentalService.successBody'));
        setOwnerName('');
        setOwnerEmail('');
        setOwnerPhone('');
        setPropertyType('');
        setPropertySize('');
        setBedrooms('');
        setBathrooms('');
        setLocation('');
        setFeatures('');
        setAdditionalDetails('');
        setErrors({});
      } else {
        toast.error(result.message || t('rentalService.errorTitle'));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('rentalService.errorTitle')));
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
            {t('rentalService.headerTitle')}
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
          {/* Hero */}
          <View className="px-5 pt-6">
            <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-3">
              <Ionicons name="home" size={28} color="#f1913d" />
            </View>
            <Text
              className="text-secondary text-[22px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('rentalService.heroTitle')}
            </Text>
            <Text
              className="text-text text-[13px] mt-2 leading-[20px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('rentalService.heroSubtitle')}
            </Text>
          </View>

          {/* How it works */}
          <View className="px-5 mt-6">
            <Text
              className="text-secondary text-[16px] font-extrabold mb-3"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('rentalService.howItWorks')}
            </Text>
            <Step
              num={1}
              title={t('rentalService.submitProperty.title')}
              text={t('rentalService.submitProperty.text')}
              isRTL={isRTL}
            />
            <Step
              num={2}
              title={t('rentalService.propertyInspection.title')}
              text={t('rentalService.propertyInspection.text')}
              isRTL={isRTL}
            />
            <Step
              num={3}
              title={t('rentalService.agreementFinalization.title')}
              text={t('rentalService.agreementFinalization.text')}
              isRTL={isRTL}
            />
            <Step
              num={4}
              title={t('rentalService.managementBegins.title')}
              text={t('rentalService.managementBegins.text')}
              isRTL={isRTL}
            />
          </View>

          {/* Commission */}
          <View className="px-5 mt-6">
            <View className="bg-cream/60 border border-line rounded-2xl p-4">
              <Text
                className="text-secondary text-[15px] font-extrabold mb-1.5"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('rentalService.commissionStructure')}
              </Text>
              <Text
                className="text-text text-[13px] leading-[20px]"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {t('rentalService.commissionText')}{' '}
                <Text className="text-primary font-extrabold">
                  {t('rentalService.commissionPercent')}
                </Text>{' '}
                {t('rentalService.commissionText2')}
              </Text>
              <View className="mt-3 bg-white border border-line rounded-xl p-3">
                <Text
                  className="text-secondary text-[12px] font-bold"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('rentalService.agreementTerms')}
                </Text>
                <Text
                  className="text-text text-[12px] mt-1 leading-[18px]"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('rentalService.agreementTermsText')}
                </Text>
              </View>
            </View>
          </View>

          {/* Form */}
          <View className="px-5 mt-8">
            <Text
              className="text-secondary text-[18px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('rentalService.formTitle')}
            </Text>
            <Text
              className="text-text text-[12px] mt-1 leading-[18px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('rentalService.formSubtitle')}
            </Text>

            <FieldLabel text={t('rentalService.ownerName')} required isRTL={isRTL} />
            <Input
              placeholder={t('rentalService.ownerNamePlaceholder')}
              value={ownerName}
              onChangeText={(v) => {
                setOwnerName(v);
                clearError('ownerName');
              }}
              error={errors.ownerName}
              isRTL={isRTL}
            />

            <FieldLabel text={t('rentalService.ownerEmail')} required isRTL={isRTL} />
            <Input
              placeholder={t('rentalService.ownerEmailPlaceholder')}
              value={ownerEmail}
              onChangeText={(v) => {
                setOwnerEmail(v);
                clearError('ownerEmail');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.ownerEmail}
              isRTL={isRTL}
            />

            <FieldLabel text={t('rentalService.ownerPhone')} required isRTL={isRTL} />
            <PhoneInput
              placeholder={t('rentalService.ownerPhonePlaceholder')}
              value={ownerPhone}
              onChange={(v) => {
                setOwnerPhone(v);
                clearError('ownerPhone');
              }}
              error={!!errors.ownerPhone}
              errorText={errors.ownerPhone}
            />

            <FieldLabel text={t('rentalService.propertyType')} required isRTL={isRTL} />
            <Pressable
              onPress={() => {
                setTypePickerOpen(true);
                clearError('propertyType');
              }}
              className={`flex-row items-center justify-between bg-white border rounded-xl px-3.5 py-3 ${
                errors.propertyType ? 'border-danger' : 'border-line active:bg-cream'
              }`}
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <Text
                className={`text-[15px] ${
                  propertyType ? 'text-secondary font-semibold' : 'text-note'
                }`}>
                {propertyType
                  ? t(`rentalService.propertyTypes.${propertyType}`)
                  : t('rentalService.selectPropertyType')}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#5c5e61" />
            </Pressable>
            {errors.propertyType ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.propertyType}
              </Text>
            ) : null}

            <FieldLabel text={t('rentalService.propertySize')} required isRTL={isRTL} />
            <Input
              placeholder={t('rentalService.propertySizePlaceholder')}
              value={propertySize}
              onChangeText={(v) => {
                setPropertySize(v.replace(/[^\d]/g, ''));
                clearError('propertySize');
              }}
              keyboardType="number-pad"
              error={errors.propertySize}
              isRTL={isRTL}
            />

            <View
              className="flex-row gap-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <FieldLabel text={t('rentalService.bedrooms')} required isRTL={isRTL} />
                <Input
                  placeholder={t('rentalService.bedroomsPlaceholder')}
                  value={bedrooms}
                  onChangeText={(v) => {
                    setBedrooms(v.replace(/[^\d]/g, ''));
                    clearError('bedrooms');
                  }}
                  keyboardType="number-pad"
                  error={errors.bedrooms}
                  isRTL={isRTL}
                />
              </View>
              <View className="flex-1">
                <FieldLabel
                  text={t('rentalService.bathrooms')}
                  required
                  isRTL={isRTL}
                />
                <Input
                  placeholder={t('rentalService.bathroomsPlaceholder')}
                  value={bathrooms}
                  onChangeText={(v) => {
                    setBathrooms(v.replace(/[^\d]/g, ''));
                    clearError('bathrooms');
                  }}
                  keyboardType="number-pad"
                  error={errors.bathrooms}
                  isRTL={isRTL}
                />
              </View>
            </View>

            <FieldLabel text={t('rentalService.location')} required isRTL={isRTL} />
            <Input
              placeholder={t('rentalService.locationPlaceholder')}
              value={location}
              onChangeText={(v) => {
                setLocation(v);
                clearError('location');
              }}
              error={errors.location}
              isRTL={isRTL}
            />

            <FieldLabel text={t('rentalService.features')} required isRTL={isRTL} />
            <TextAreaInput
              placeholder={t('rentalService.featuresPlaceholder')}
              value={features}
              onChangeText={(v) => {
                setFeatures(v);
                clearError('features');
              }}
              error={errors.features}
              isRTL={isRTL}
            />

            <FieldLabel text={t('rentalService.additionalDetails')} isRTL={isRTL} />
            <TextAreaInput
              placeholder={t('rentalService.additionalDetailsPlaceholder')}
              value={additionalDetails}
              onChangeText={setAdditionalDetails}
              isRTL={isRTL}
            />

            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`mt-6 rounded-2xl py-4 items-center ${
                mutation.isPending ? 'bg-primary/70' : 'bg-primary active:opacity-90'
              }`}>
              <Text className="text-white text-[15px] font-bold">
                {mutation.isPending
                  ? t('rentalService.submitting')
                  : t('rentalService.submit')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Property type picker */}
      <Modal
        visible={typePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTypePickerOpen(false)}
        statusBarTranslucent>
        <Pressable className="flex-1 bg-black/50" onPress={() => setTypePickerOpen(false)}>
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
              {t('rentalService.propertyType')}
            </Text>
            <Pressable
              onPress={() => setTypePickerOpen(false)}
              hitSlop={10}
              className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
              <CloseIcon color="#111827" />
            </Pressable>
          </View>
          <ScrollView className="px-3 pb-3" style={{ maxHeight: 420 }}>
            {PROPERTY_TYPES.map((key) => {
              const active = propertyType === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setPropertyType(key);
                    setTypePickerOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-3 py-3.5 rounded-xl ${
                    active ? 'bg-primary-50' : 'active:bg-cream'
                  }`}
                  style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                  <Text
                    className={`text-[15px] font-semibold ${
                      active ? 'text-primary' : 'text-secondary'
                    }`}>
                    {t(`rentalService.propertyTypes.${key}`)}
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

function Step({
  num,
  title,
  text,
  isRTL,
}: {
  num: number;
  title: string;
  text: string;
  isRTL: boolean;
}) {
  return (
    <View
      className="flex-row items-start gap-3 mb-3"
      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
        <Text className="text-white text-[14px] font-extrabold">{num}</Text>
      </View>
      <View className="flex-1">
        <Text
          className="text-secondary text-[14px] font-extrabold"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {title}
        </Text>
        <Text
          className="text-text text-[12px] mt-0.5 leading-[18px]"
          style={{ textAlign: isRTL ? 'right' : 'left' }}>
          {text}
        </Text>
      </View>
    </View>
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

function TextAreaInput({
  placeholder,
  value,
  onChangeText,
  error,
  isRTL,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  isRTL: boolean;
}) {
  return (
    <View>
      <View
        className={`bg-white border rounded-xl px-3.5 ${
          error ? 'border-danger' : 'border-line'
        }`}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#a8abae"
          value={value}
          onChangeText={onChangeText}
          multiline
          numberOfLines={4}
          className="text-secondary text-[15px]"
          style={{
            minHeight: 100,
            textAlignVertical: 'top',
            textAlign: isRTL ? 'right' : 'left',
            paddingTop: 12,
            paddingBottom: 12,
          }}
        />
      </View>
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
