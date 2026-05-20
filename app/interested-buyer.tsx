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
  futureBuyerAPI,
  type FutureBuyerCurrency,
  type FutureBuyerPayload,
  type FutureBuyerSizeUnit,
  type FutureBuyerStatus,
} from '@/apis/futureBuyer';
import { useToast } from '@/components/feedback/toast';
import { CloseIcon } from '@/components/icons/svg-icons';
import { getApiErrorMessage } from '@/lib/api';

const CITIES = [
  'Damascus',
  'Latakia',
  'Aleppo',
  'Homs',
  'Hama',
  'Tartus',
  'Idlib',
  'Daraa',
  'As-Suwayda',
  'Deir ez-Zur',
  'Raqqah',
];

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'Building',
  'Land',
  'Holiday Home',
  'Office',
  'Commercial',
];

const CURRENCIES: { code: FutureBuyerCurrency; label: string }[] = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'SYP', label: 'SYP' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'TRY', label: 'TRY (₺)' },
];

const SIZE_UNITS: FutureBuyerSizeUnit[] = ['sqm', 'dunam', 'sqft', 'sqyd', 'feddan'];

type FieldErrors = Partial<{
  name: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  status: string;
  priceRange: string;
  sizeRange: string;
}>;

function isEmailValid(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function InterestedBuyerScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [status, setStatus] = useState<FutureBuyerStatus>('both');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currency, setCurrency] = useState<FutureBuyerCurrency>('USD');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState<FutureBuyerSizeUnit>('sqm');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const [openPicker, setOpenPicker] = useState<
    null | 'city' | 'propertyType' | 'currency' | 'sizeUnit'
  >(null);

  const mutation = useMutation({
    mutationFn: (payload: FutureBuyerPayload) =>
      futureBuyerAPI.createFutureBuyer(payload),
  });

  const clearError = (k: keyof FieldErrors) =>
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));

  const onSubmit = async () => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) next.name = t('interestedBuyer.errors.nameRequired');
    if (!trimmedPhone) next.phone = t('interestedBuyer.errors.phoneRequired');
    else if (trimmedPhone.replace(/\D/g, '').length < 6)
      next.phone = t('interestedBuyer.errors.invalidPhone');
    if (!city) next.city = t('interestedBuyer.errors.cityRequired');
    if (!propertyType)
      next.propertyType = t('interestedBuyer.errors.propertyTypeRequired');
    if (!status) next.status = t('interestedBuyer.errors.statusRequired');
    if (trimmedEmail && !isEmailValid(trimmedEmail))
      next.email = t('interestedBuyer.errors.invalidEmail');

    if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice))
      next.priceRange = t('interestedBuyer.errors.invalidPriceRange');
    if (minSize && maxSize && parseFloat(minSize) > parseFloat(maxSize))
      next.sizeRange = t('interestedBuyer.errors.invalidSizeRange');

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        name: trimmedName,
        email: trimmedEmail || undefined,
        phone: trimmedPhone,
        city,
        propertyType,
        status,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        currency,
        minSize: minSize ? parseFloat(minSize) : undefined,
        maxSize: maxSize ? parseFloat(maxSize) : undefined,
        sizeUnit,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        notes: notes.trim() || undefined,
        website: '',
      });

      if (result.success) {
        const count = result.matchedPropertiesCount ?? 0;
        toast.success(
          count > 0
            ? t('interestedBuyer.successWithCount', { count })
            : t('interestedBuyer.successDefault')
        );
        setName('');
        setEmail('');
        setPhone('');
        setCity('');
        setPropertyType('');
        setStatus('both');
        setMinPrice('');
        setMaxPrice('');
        setMinSize('');
        setMaxSize('');
        setBedrooms('');
        setBathrooms('');
        setNotes('');
        setErrors({});
      } else {
        toast.error(result.message || t('interestedBuyer.errorTitle'));
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('interestedBuyer.errorTitle')));
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
            {t('interestedBuyer.headerTitle')}
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
            <Text
              className="text-secondary text-[22px] font-extrabold tracking-tight"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('interestedBuyer.heroTitle')}
            </Text>
            <Text
              className="text-text text-[13px] mt-2 leading-[20px]"
              style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {t('interestedBuyer.heroSubtitle')}
            </Text>
          </View>

          <View className="px-5 mt-6">
            {/* Contact info */}
            <FieldLabel text={t('interestedBuyer.name')} required isRTL={isRTL} />
            <Input
              placeholder={t('interestedBuyer.namePlaceholder')}
              value={name}
              onChangeText={(v) => {
                setName(v);
                clearError('name');
              }}
              error={errors.name}
              isRTL={isRTL}
            />

            <FieldLabel
              text={`${t('interestedBuyer.email')} (${t('interestedBuyer.optional')})`}
              isRTL={isRTL}
            />
            <Input
              placeholder={t('interestedBuyer.emailPlaceholder')}
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

            <FieldLabel text={t('interestedBuyer.phone')} required isRTL={isRTL} />
            <Input
              placeholder={t('interestedBuyer.phonePlaceholder')}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
                clearError('phone');
              }}
              keyboardType="phone-pad"
              error={errors.phone}
              isRTL={isRTL}
            />

            {/* Requirements */}
            <FieldLabel text={t('interestedBuyer.city')} required isRTL={isRTL} />
            <Picker
              value={city ? city : ''}
              placeholder={t('interestedBuyer.selectCity')}
              error={errors.city}
              isRTL={isRTL}
              onPress={() => {
                setOpenPicker('city');
                clearError('city');
              }}
            />

            <FieldLabel
              text={t('interestedBuyer.propertyType')}
              required
              isRTL={isRTL}
            />
            <Picker
              value={propertyType}
              placeholder={t('interestedBuyer.selectPropertyType')}
              error={errors.propertyType}
              isRTL={isRTL}
              onPress={() => {
                setOpenPicker('propertyType');
                clearError('propertyType');
              }}
            />

            <FieldLabel text={t('interestedBuyer.status')} required isRTL={isRTL} />
            <View
              className="flex-row p-1 rounded-full border border-line bg-white"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              {(
                [
                  { v: 'both' as const, l: t('interestedBuyer.statusBoth') },
                  { v: 'sale' as const, l: t('interestedBuyer.statusSale') },
                  { v: 'rent' as const, l: t('interestedBuyer.statusRent') },
                ]
              ).map(({ v, l }) => {
                const active = status === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => {
                      setStatus(v);
                      clearError('status');
                    }}
                    className={`flex-1 py-1.5 rounded-full items-center ${
                      active ? 'bg-primary' : 'active:bg-cream'
                    }`}>
                    <Text
                      className={`text-[13px] font-bold ${
                        active ? 'text-white' : 'text-secondary'
                      }`}>
                      {l}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Price */}
            <FieldLabel text={t('interestedBuyer.priceRange')} isRTL={isRTL} />
            <View
              className="flex-row gap-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <NumberInput
                  placeholder={t('interestedBuyer.minPrice')}
                  value={minPrice}
                  onChangeText={(v) => {
                    setMinPrice(v);
                    setErrors((prev) =>
                      prev.priceRange ? { ...prev, priceRange: undefined } : prev
                    );
                  }}
                  isRTL={isRTL}
                />
              </View>
              <View className="flex-1">
                <NumberInput
                  placeholder={t('interestedBuyer.maxPrice')}
                  value={maxPrice}
                  onChangeText={(v) => {
                    setMaxPrice(v);
                    setErrors((prev) =>
                      prev.priceRange ? { ...prev, priceRange: undefined } : prev
                    );
                  }}
                  isRTL={isRTL}
                />
              </View>
            </View>
            {errors.priceRange ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.priceRange}
              </Text>
            ) : null}

            <FieldLabel text={t('interestedBuyer.currency')} isRTL={isRTL} />
            <Picker
              value={CURRENCIES.find((c) => c.code === currency)?.label ?? currency}
              placeholder=""
              isRTL={isRTL}
              onPress={() => setOpenPicker('currency')}
            />

            {/* Size */}
            <FieldLabel text={t('interestedBuyer.sizeRange')} isRTL={isRTL} />
            <View
              className="flex-row gap-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <NumberInput
                  placeholder={t('interestedBuyer.minSize')}
                  value={minSize}
                  onChangeText={(v) => {
                    setMinSize(v);
                    setErrors((prev) =>
                      prev.sizeRange ? { ...prev, sizeRange: undefined } : prev
                    );
                  }}
                  isRTL={isRTL}
                />
              </View>
              <View className="flex-1">
                <NumberInput
                  placeholder={t('interestedBuyer.maxSize')}
                  value={maxSize}
                  onChangeText={(v) => {
                    setMaxSize(v);
                    setErrors((prev) =>
                      prev.sizeRange ? { ...prev, sizeRange: undefined } : prev
                    );
                  }}
                  isRTL={isRTL}
                />
              </View>
            </View>
            {errors.sizeRange ? (
              <Text
                className="text-danger text-[12px] mt-1"
                style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {errors.sizeRange}
              </Text>
            ) : null}

            <FieldLabel text={t('interestedBuyer.sizeUnit')} isRTL={isRTL} />
            <Picker
              value={sizeUnit}
              placeholder=""
              isRTL={isRTL}
              onPress={() => setOpenPicker('sizeUnit')}
            />

            {/* Bedrooms / bathrooms */}
            <View
              className="flex-row gap-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <FieldLabel text={t('interestedBuyer.bedrooms')} isRTL={isRTL} />
                <NumberInput
                  placeholder="0"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                  isRTL={isRTL}
                />
              </View>
              <View className="flex-1">
                <FieldLabel text={t('interestedBuyer.bathrooms')} isRTL={isRTL} />
                <NumberInput
                  placeholder="0"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                  isRTL={isRTL}
                />
              </View>
            </View>

            {/* Notes */}
            <FieldLabel text={t('interestedBuyer.notes')} isRTL={isRTL} />
            <View className="bg-white border border-line rounded-xl px-3.5">
              <TextInput
                placeholder={t('interestedBuyer.notesPlaceholder')}
                placeholderTextColor="#a8abae"
                value={notes}
                onChangeText={setNotes}
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

            {/* Submit */}
            <Pressable
              onPress={onSubmit}
              disabled={mutation.isPending}
              className={`mt-6 rounded-2xl py-4 items-center ${
                mutation.isPending ? 'bg-primary/70' : 'bg-primary active:opacity-90'
              }`}>
              <Text className="text-white text-[15px] font-bold">
                {mutation.isPending
                  ? t('interestedBuyer.submitting')
                  : t('interestedBuyer.submit')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker bottom sheet */}
      <PickerSheet
        visible={openPicker === 'city'}
        title={t('interestedBuyer.city')}
        options={CITIES.map((c) => ({
          value: c,
          label: t(`cities.${c}`, { defaultValue: c }),
        }))}
        selected={city}
        onSelect={(v) => {
          setCity(v);
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
        isRTL={isRTL}
      />
      <PickerSheet
        visible={openPicker === 'propertyType'}
        title={t('interestedBuyer.propertyType')}
        options={PROPERTY_TYPES.map((p) => ({
          value: p,
          label: t(`propertyTypes.${p}`, { defaultValue: p }),
        }))}
        selected={propertyType}
        onSelect={(v) => {
          setPropertyType(v);
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
        isRTL={isRTL}
      />
      <PickerSheet
        visible={openPicker === 'currency'}
        title={t('interestedBuyer.currency')}
        options={CURRENCIES.map((c) => ({ value: c.code, label: c.label }))}
        selected={currency}
        onSelect={(v) => {
          setCurrency(v as FutureBuyerCurrency);
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
        isRTL={isRTL}
      />
      <PickerSheet
        visible={openPicker === 'sizeUnit'}
        title={t('interestedBuyer.sizeUnit')}
        options={SIZE_UNITS.map((u) => ({ value: u, label: u }))}
        selected={sizeUnit}
        onSelect={(v) => {
          setSizeUnit(v as FutureBuyerSizeUnit);
          setOpenPicker(null);
        }}
        onClose={() => setOpenPicker(null)}
        isRTL={isRTL}
      />
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

function NumberInput({
  placeholder,
  value,
  onChangeText,
  isRTL,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  isRTL: boolean;
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#a8abae"
      value={value}
      onChangeText={(v) => onChangeText(v.replace(/[^\d.]/g, ''))}
      keyboardType="decimal-pad"
      className="bg-white border border-line rounded-xl px-3.5 py-3 text-secondary text-[15px]"
      style={{ textAlign: isRTL ? 'right' : 'left' }}
    />
  );
}

function Picker({
  value,
  placeholder,
  error,
  isRTL,
  onPress,
}: {
  value: string;
  placeholder: string;
  error?: string;
  isRTL: boolean;
  onPress: () => void;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className={`flex-row items-center justify-between bg-white border rounded-xl px-3.5 py-3 ${
          error ? 'border-danger' : 'border-line active:bg-cream'
        }`}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <Text
          className={`text-[15px] ${
            value ? 'text-secondary font-semibold' : 'text-note'
          }`}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#5c5e61" />
      </Pressable>
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

function PickerSheet({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  isRTL,
}: {
  visible: boolean;
  title: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  isRTL: boolean;
}) {
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
      <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl">
        <View className="items-center pt-3">
          <View className="w-10 h-1.5 rounded-full bg-gray-300" />
        </View>
        <View
          className="px-5 pt-3 pb-3 flex-row items-center justify-between"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Text className="text-brand text-lg font-bold">{title}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
            <CloseIcon color="#111827" />
          </Pressable>
        </View>
        <ScrollView className="px-3 pb-3" style={{ maxHeight: 420 }}>
          {options.map((opt) => {
            const active = selected === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => onSelect(opt.value)}
                className={`flex-row items-center justify-between px-3 py-3.5 rounded-xl ${
                  active ? 'bg-primary-50' : 'active:bg-cream'
                }`}
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                <Text
                  className={`text-[15px] font-semibold ${
                    active ? 'text-primary' : 'text-secondary'
                  }`}>
                  {opt.label}
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
  );
}
