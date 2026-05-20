import { useEffect, useState } from 'react';
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

import { CloseIcon } from './icons/svg-icons';

export type PropertyFiltersValue = {
  status: '' | 'sale' | 'rent';
  propertyType: string;
  city: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
};

export const EMPTY_FILTERS: PropertyFiltersValue = {
  status: '',
  propertyType: '',
  city: '',
  priceMin: '',
  priceMax: '',
  currency: '',
  bedrooms: '',
  bathrooms: '',
};

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'USD', label: 'USD ($)' },
  { code: 'SYP', label: 'SYP' },
  { code: 'EUR', label: 'EUR (€)' },
  { code: 'TRY', label: 'TRY (₺)' },
];

const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'House',
  'Land',
  'Office',
  'Commercial',
  'Building',
  'Holiday Home',
  'Chalet',
];

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

const BED_BATH = ['1', '2', '3', '4', '5'];

type Props = {
  visible: boolean;
  value: PropertyFiltersValue;
  onClose: () => void;
  onApply: (next: PropertyFiltersValue) => void;
};

export function PropertyFilterModal({ visible, value, onClose, onApply }: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [draft, setDraft] = useState<PropertyFiltersValue>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const setField = <K extends keyof PropertyFiltersValue>(
    key: K,
    next: PropertyFiltersValue[K]
  ) => setDraft((prev) => ({ ...prev, [key]: next }));

  const reset = () => setDraft(EMPTY_FILTERS);

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <SafeAreaView
          edges={['bottom']}
          className="bg-white rounded-t-3xl"
          style={{ maxHeight: '88%' }}>
          <View className="items-center pt-3">
            <View className="w-10 h-1.5 rounded-full bg-gray-300" />
          </View>
          <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
            <Text className="text-brand text-lg font-bold">
              {t('filterModal.title')}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
              <CloseIcon color="#111827" />
            </Pressable>
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled">
            {/* Status */}
            <FilterLabel text={t('filterModal.status')} isRTL={isRTL} />
            <ChipRow
              items={[
                { label: t('filterModal.any'), value: '' as const },
                { label: t('filterModal.forSale'), value: 'sale' as const },
                { label: t('filterModal.forRent'), value: 'rent' as const },
              ]}
              selected={draft.status}
              onSelect={(v) => setField('status', v)}
              isRTL={isRTL}
            />

            {/* Property type */}
            <FilterLabel text={t('filterModal.propertyType')} isRTL={isRTL} />
            <ChipRow
              wrap
              items={[
                { label: t('filterModal.allTypes'), value: '' },
                ...PROPERTY_TYPES.map((p) => ({
                  label: t(`propertyTypes.${p}`, { defaultValue: p }),
                  value: p,
                })),
              ]}
              selected={draft.propertyType}
              onSelect={(v) => setField('propertyType', v)}
              isRTL={isRTL}
            />

            {/* City */}
            <FilterLabel text={t('filterModal.city')} isRTL={isRTL} />
            <ChipRow
              wrap
              items={[
                { label: t('filterModal.allCities'), value: '' },
                ...CITIES.map((c) => ({
                  label: t(`cities.${c}`, { defaultValue: c }),
                  value: c,
                })),
              ]}
              selected={draft.city}
              onSelect={(v) => setField('city', v)}
              isRTL={isRTL}
            />

            {/* Price */}
            <FilterLabel text={t('filterModal.price')} isRTL={isRTL} />
            <View
              className="flex-row gap-3"
              style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <Text
                  className="text-note text-[11px] font-semibold mb-1.5 uppercase tracking-wide"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('filterModal.from')}
                </Text>
                <NumberField
                  placeholder={t('filterModal.minPrice')}
                  value={draft.priceMin}
                  onChangeText={(v) => setField('priceMin', v)}
                  isRTL={isRTL}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-note text-[11px] font-semibold mb-1.5 uppercase tracking-wide"
                  style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {t('filterModal.to')}
                </Text>
                <NumberField
                  placeholder={t('filterModal.maxPrice')}
                  value={draft.priceMax}
                  onChangeText={(v) => setField('priceMax', v)}
                  isRTL={isRTL}
                />
              </View>
            </View>

            {/* Currency */}
            <FilterLabel text={t('filterModal.currency')} isRTL={isRTL} />
            <ChipRow
              items={[
                { label: t('filterModal.any'), value: '' },
                ...CURRENCIES.map((c) => ({ label: c.label, value: c.code })),
              ]}
              selected={draft.currency}
              onSelect={(v) => setField('currency', v)}
              isRTL={isRTL}
            />

            {/* Bedrooms */}
            <FilterLabel text={t('filterModal.bedrooms')} isRTL={isRTL} />
            <ChipRow
              wrap
              items={[
                { label: t('filterModal.any'), value: '' },
                ...BED_BATH.map((n, i) => ({
                  label: i === BED_BATH.length - 1 ? `${n}+` : n,
                  value: n,
                })),
              ]}
              selected={draft.bedrooms}
              onSelect={(v) => setField('bedrooms', v)}
              isRTL={isRTL}
            />

            {/* Bathrooms */}
            <FilterLabel text={t('filterModal.bathrooms')} isRTL={isRTL} />
            <ChipRow
              wrap
              items={[
                { label: t('filterModal.any'), value: '' },
                ...BED_BATH.map((n, i) => ({
                  label: i === BED_BATH.length - 1 ? `${n}+` : n,
                  value: n,
                })),
              ]}
              selected={draft.bathrooms}
              onSelect={(v) => setField('bathrooms', v)}
              isRTL={isRTL}
            />
          </ScrollView>

          {/* Footer actions */}
          <View
            className="px-5 pt-3 pb-2 border-t border-line flex-row gap-3"
            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
            <Pressable
              onPress={reset}
              className="flex-1 py-3 rounded-xl border border-line items-center active:bg-cream">
              <Text className="text-secondary font-semibold text-[15px]">
                {t('filterModal.reset')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onApply(draft)}
              className="flex-[2] py-3 rounded-xl bg-primary items-center active:opacity-90">
              <Text className="text-white font-bold text-[15px]">
                {t('filterModal.apply')}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FilterLabel({ text, isRTL }: { text: string; isRTL: boolean }) {
  return (
    <Text
      className="text-secondary text-[13px] font-bold mt-4 mb-2"
      style={{ textAlign: isRTL ? 'right' : 'left' }}>
      {text}
    </Text>
  );
}

function ChipRow<T extends string>({
  items,
  selected,
  onSelect,
  isRTL,
  wrap = false,
}: {
  items: { label: string; value: T }[];
  selected: T;
  onSelect: (v: T) => void;
  isRTL: boolean;
  wrap?: boolean;
}) {
  return (
    <View
      className={`flex-row ${wrap ? 'flex-wrap' : ''} gap-2`}
      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      {items.map((item) => {
        const active = selected === item.value;
        return (
          <Pressable
            key={`${item.value || 'any'}`}
            onPress={() => onSelect(item.value)}
            className={`px-3.5 py-2 rounded-full border ${
              active
                ? 'bg-primary border-primary'
                : 'bg-white border-line active:bg-cream'
            }`}>
            <Text
              className={`text-[13px] font-semibold ${
                active ? 'text-white' : 'text-secondary'
              }`}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumberField({
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
      onChangeText={(v) => onChangeText(v.replace(/[^\d]/g, ''))}
      keyboardType="number-pad"
      className="flex-1 bg-white border border-line rounded-xl px-3 py-2.5 text-secondary text-[14px]"
      style={{ textAlign: isRTL ? 'right' : 'left' }}
    />
  );
}
