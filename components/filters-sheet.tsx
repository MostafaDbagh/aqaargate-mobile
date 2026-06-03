import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PROPERTY_TYPES, PROPERTY_TYPE_AR } from '@/constants/property-types';
import type { SearchParams } from '@/lib/api';

import { CloseIcon } from './icons/svg-icons';

type FilterValue = Partial<SearchParams>;

type Props = {
  visible: boolean;
  value: FilterValue;
  onApply: (next: FilterValue) => void;
  onClose: () => void;
};

const CITIES = [
  'Latakia',
  'Damascus',
  'Aleppo',
  'Homs',
  'Hama',
  'Idlib',
  'Deir ez-Zur',
  'Daraa',
  'Tartus',
  'As-Suwayda',
  'Raqqah',
] as const;

const BEDROOM_OPTIONS = ['studio', '1', '2', '3', '4', '5', '6'] as const;
const BATHROOM_OPTIONS = ['1', '2', '3', '4', '5', '6'] as const;
const CURRENCIES = ['USD', 'SYP', 'TRY', 'EUR'] as const;
const SIZE_UNITS = ['sqm', 'dunam', 'sqft', 'sqyd', 'feddan'] as const;

const AMENITIES: { value: string; tKey: string }[] = [
  { value: 'Solar energy system', tKey: 'solarEnergySystem' },
  { value: 'Star link internet', tKey: 'starLinkInternet' },
  { value: 'Fiber internet', tKey: 'fiberInternet' },
  { value: 'Basic internet', tKey: 'basicInternet' },
  { value: 'Parking', tKey: 'parking' },
  { value: 'Lift', tKey: 'lift' },
  { value: 'A/C', tKey: 'ac' },
  { value: 'Gym', tKey: 'gym' },
  { value: 'Security cameras', tKey: 'securityCameras' },
  { value: 'Reception (nator)', tKey: 'receptionNator' },
  { value: 'Balcony', tKey: 'balcony' },
  { value: 'Swimming pool', tKey: 'swimmingPool' },
  { value: 'Fire alarms', tKey: 'fireAlarms' },
];

const CITY_AR: Record<string, string> = {
  Latakia: 'اللاذقية',
  Damascus: 'دمشق',
  Aleppo: 'حلب',
  Homs: 'حمص',
  Hama: 'حماة',
  Idlib: 'إدلب',
  'Deir ez-Zur': 'دير الزور',
  Daraa: 'درعا',
  Tartus: 'طرطوس',
  'As-Suwayda': 'السويداء',
  Raqqah: 'الرقة',
};

const NON_RESIDENTIAL = new Set(['Commercial', 'Land', 'Building']);

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3.5 py-2 rounded-full border ${
        active
          ? 'bg-primary border-primary'
          : 'bg-white border-line active:bg-cream'
      }`}>
      <Text
        className={`text-[13px] font-bold ${
          active ? 'text-white' : 'text-secondary'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-secondary text-[14px] font-bold mb-2">
      {children}
    </Text>
  );
}

export function FiltersSheet({ visible, value, onApply, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [draft, setDraft] = useState<FilterValue>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  const set = (patch: FilterValue) => setDraft((d) => ({ ...d, ...patch }));

  const toggleAmenity = (a: string) => {
    const list = new Set(draft.amenities ?? []);
    if (list.has(a)) list.delete(a);
    else list.add(a);
    set({ amenities: Array.from(list) });
  };

  const reset = () => {
    setDraft({});
  };

  const apply = () => {
    onApply({
      status: draft.status ?? '',
      city: draft.city ?? '',
      propertyType: draft.propertyType ?? '',
      bedrooms: draft.bedrooms ?? '',
      bathrooms: draft.bathrooms ?? '',
      furnished: draft.furnished ?? '',
      priceMin: draft.priceMin ?? '',
      priceMax: draft.priceMax ?? '',
      currency: draft.currency ?? '',
      sizeMin: draft.sizeMin ?? '',
      sizeMax: draft.sizeMax ?? '',
      sizeUnit: draft.sizeUnit ?? '',
      amenities: draft.amenities ?? [],
    });
    onClose();
  };

  const showResidential = !NON_RESIDENTIAL.has(draft.propertyType ?? '');

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
      <SafeAreaView edges={['bottom']} className="bg-white rounded-t-3xl" style={{ maxHeight: '88%' }}>
        <View className="items-center pt-3">
          <View className="w-10 h-1.5 rounded-full bg-gray-300" />
        </View>
        <View
          className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-line"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <Text className="text-secondary text-lg font-bold">
            {t('searchForm.advancedSearch')}
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}>
          {/* Looking for */}
          <View className="mb-6">
            <SectionLabel>{t('searchForm.lookingFor')}</SectionLabel>
            <View
              className="flex-row gap-2"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              {[
                { key: '', label: t('searchForm.intentAny') },
                { key: 'rent', label: t('searchForm.intentRent') },
                { key: 'sale', label: t('searchForm.intentBuy') },
              ].map((opt) => (
                <Chip
                  key={opt.key || 'any'}
                  label={opt.label}
                  active={(draft.status ?? '') === opt.key}
                  onPress={() => set({ status: opt.key })}
                />
              ))}
            </View>
          </View>

          {/* City */}
          <View className="mb-6">
            <SectionLabel>{t('searchForm.city')}</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t('searchForm.allCities')}
                active={!draft.city}
                onPress={() => set({ city: '' })}
              />
              {CITIES.map((c) => (
                <Chip
                  key={c}
                  label={isAr ? CITY_AR[c] ?? c : c}
                  active={draft.city === c}
                  onPress={() => set({ city: c })}
                />
              ))}
            </View>
          </View>

          {/* Property type */}
          <View className="mb-6">
            <SectionLabel>{t('searchForm.propertyType')}</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t('searchForm.anyType')}
                active={!draft.propertyType}
                onPress={() => set({ propertyType: '' })}
              />
              {PROPERTY_TYPES.map((p) => (
                <Chip
                  key={p}
                  label={isAr ? PROPERTY_TYPE_AR[p] ?? p : p}
                  active={draft.propertyType === p}
                  onPress={() => set({ propertyType: p })}
                />
              ))}
            </View>
          </View>

          {showResidential ? (
            <>
              {/* Rooms */}
              <View className="mb-6">
                <SectionLabel>{t('searchForm.rooms')}</SectionLabel>
                <View className="flex-row flex-wrap gap-2">
                  <Chip
                    label={t('searchForm.any')}
                    active={!draft.bedrooms}
                    onPress={() => set({ bedrooms: '' })}
                  />
                  {BEDROOM_OPTIONS.map((b) => (
                    <Chip
                      key={b}
                      label={b === 'studio' ? t('searchForm.studio') : b}
                      active={draft.bedrooms === b}
                      onPress={() => set({ bedrooms: b })}
                    />
                  ))}
                </View>
              </View>

              {/* Baths */}
              <View className="mb-6">
                <SectionLabel>{t('searchForm.baths')}</SectionLabel>
                <View className="flex-row flex-wrap gap-2">
                  <Chip
                    label={t('searchForm.any')}
                    active={!draft.bathrooms}
                    onPress={() => set({ bathrooms: '' })}
                  />
                  {BATHROOM_OPTIONS.map((b) => (
                    <Chip
                      key={b}
                      label={b}
                      active={draft.bathrooms === b}
                      onPress={() => set({ bathrooms: b })}
                    />
                  ))}
                </View>
              </View>

              {/* Furnishing */}
              <View className="mb-6">
                <SectionLabel>{t('searchForm.furnishing')}</SectionLabel>
                <View
                  className="flex-row gap-2"
                  style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                  <Chip
                    label={t('searchForm.any')}
                    active={!draft.furnished}
                    onPress={() => set({ furnished: '' })}
                  />
                  <Chip
                    label={t('searchForm.furnished')}
                    active={draft.furnished === 'true'}
                    onPress={() => set({ furnished: 'true' })}
                  />
                  <Chip
                    label={t('searchForm.unfurnished')}
                    active={draft.furnished === 'false'}
                    onPress={() => set({ furnished: 'false' })}
                  />
                </View>
              </View>
            </>
          ) : null}

          {/* Price range */}
          <View className="mb-6">
            <View
              className="flex-row items-center justify-between mb-2"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <SectionLabel>{t('searchForm.priceRange')}</SectionLabel>
              <Pressable
                onPress={() => set({ priceMin: '', priceMax: '' })}
                hitSlop={6}>
                <Text className="text-primary text-[12px] font-bold">
                  {t('searchForm.reset')}
                </Text>
              </Pressable>
            </View>
            <View
              className="flex-row gap-2"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <Text className="text-note text-[11px] mb-1">
                  {t('searchForm.from')}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={draft.priceMin ?? ''}
                  onChangeText={(v) => set({ priceMin: v.replace(/[^0-9]/g, '') })}
                  placeholder={t('searchForm.minPrice')}
                  placeholderTextColor="#a8abae"
                  className="border border-line rounded-xl px-3 py-2.5 text-secondary"
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-note text-[11px] mb-1">
                  {t('searchForm.to')}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={draft.priceMax ?? ''}
                  onChangeText={(v) => set({ priceMax: v.replace(/[^0-9]/g, '') })}
                  placeholder={t('searchForm.maxPrice')}
                  placeholderTextColor="#a8abae"
                  className="border border-line rounded-xl px-3 py-2.5 text-secondary"
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                />
              </View>
            </View>
            <Text className="text-note text-[11px] mt-3 mb-1">
              {t('searchForm.currency')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t('searchForm.any')}
                active={!draft.currency}
                onPress={() => set({ currency: '' })}
              />
              {CURRENCIES.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={draft.currency === c}
                  onPress={() => set({ currency: c })}
                />
              ))}
            </View>
          </View>

          {/* Size range */}
          <View className="mb-6">
            <View
              className="flex-row items-center justify-between mb-2"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <SectionLabel>{t('searchForm.sizeRange')}</SectionLabel>
              <Pressable
                onPress={() => set({ sizeMin: '', sizeMax: '' })}
                hitSlop={6}>
                <Text className="text-primary text-[12px] font-bold">
                  {t('searchForm.reset')}
                </Text>
              </Pressable>
            </View>
            <View
              className="flex-row gap-2"
              style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <View className="flex-1">
                <Text className="text-note text-[11px] mb-1">
                  {t('searchForm.from')}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={draft.sizeMin ?? ''}
                  onChangeText={(v) => set({ sizeMin: v.replace(/[^0-9]/g, '') })}
                  placeholder={t('searchForm.minSize')}
                  placeholderTextColor="#a8abae"
                  className="border border-line rounded-xl px-3 py-2.5 text-secondary"
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-note text-[11px] mb-1">
                  {t('searchForm.to')}
                </Text>
                <TextInput
                  keyboardType="number-pad"
                  value={draft.sizeMax ?? ''}
                  onChangeText={(v) => set({ sizeMax: v.replace(/[^0-9]/g, '') })}
                  placeholder={t('searchForm.maxSize')}
                  placeholderTextColor="#a8abae"
                  className="border border-line rounded-xl px-3 py-2.5 text-secondary"
                  style={{ textAlign: isAr ? 'right' : 'left' }}
                />
              </View>
            </View>
            <Text className="text-note text-[11px] mt-3 mb-1">
              {t('searchForm.sizeUnit')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <Chip
                label={t('searchForm.any')}
                active={!draft.sizeUnit}
                onPress={() => set({ sizeUnit: '' })}
              />
              {SIZE_UNITS.map((u) => (
                <Chip
                  key={u}
                  label={u}
                  active={draft.sizeUnit === u}
                  onPress={() => set({ sizeUnit: u })}
                />
              ))}
            </View>
          </View>

          {/* Amenities */}
          <View className="mb-2">
            <SectionLabel>{t('searchForm.amenities')}</SectionLabel>
            <View className="flex-row flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const active = (draft.amenities ?? []).includes(a.value);
                return (
                  <Chip
                    key={a.value}
                    label={t(`amenities.${a.tKey}`)}
                    active={active}
                    onPress={() => toggleAmenity(a.value)}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          className="px-5 pt-3 pb-3 border-t border-line flex-row gap-3"
          style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <Pressable
            onPress={reset}
            className="flex-1 py-3 rounded-xl border border-line items-center active:bg-cream">
            <Text className="text-secondary text-[14px] font-bold">
              {t('searchForm.clearAll')}
            </Text>
          </Pressable>
          <Pressable
            onPress={apply}
            className="flex-[1.4] py-3 rounded-xl bg-primary items-center active:opacity-90">
            <Text className="text-white text-[14px] font-bold">
              {t('searchForm.apply')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
