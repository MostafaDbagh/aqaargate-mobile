import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { CloseIcon } from '@/components/icons/svg-icons';
import {
  countryCodes,
  DEFAULT_COUNTRY_CODE,
  extractCountryCode,
  findCountryByCode,
  type CountryCode,
} from '@/constants/country-codes';

/**
 * Reusable international phone input (React Native port of the web PhoneInput).
 *
 * Combined value model: the parent stores a single phone string and `onChange`
 * receives the full number as `${dialCode}${nationalDigits}` (e.g. "+963988123456").
 * The country code (default Syria +963) and the national number sit side by side;
 * the code selector opens a searchable modal of countries.
 */
export type PhoneInputProps = {
  value?: string;
  onChange?: (fullValue: string) => void;
  onBlur?: () => void;
  defaultCountryCode?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  containerClassName?: string;
};

export function PhoneInput({
  value = '',
  onChange,
  onBlur,
  defaultCountryCode = DEFAULT_COUNTRY_CODE,
  label,
  placeholder = '',
  disabled = false,
  error = false,
  errorText,
  containerClassName = '',
}: PhoneInputProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Derive dial code + national number from the incoming combined value.
  const extracted = useMemo(() => extractCountryCode(value), [value]);
  const national = extracted ? extracted.phoneNumber : value || '';

  // `pickedCode` only matters when the value carries no code of its own.
  const [pickedCode, setPickedCode] = useState(extracted?.countryCode || defaultCountryCode);
  const dialCode = extracted?.countryCode || pickedCode;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);

  const selectedCountry = useMemo(() => findCountryByCode(dialCode) || countryCodes[0], [dialCode]);

  const emit = (code: string, nationalNum: string) => {
    // With an explicit country code the national number drops any leading zero.
    const digits = (nationalNum || '').replace(/[^\d]/g, '').replace(/^0+/, '');
    onChange?.(digits ? `${code}${digits}` : '');
  };

  const handleNumberChange = (text: string) => {
    setPickedCode(dialCode); // keep the active code sticky even if number is cleared
    emit(dialCode, text);
  };

  const handleSelectCode = (code: string) => {
    setPickedCode(code);
    setOpen(false);
    setSearch('');
    emit(code, national);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return countryCodes;
    return countryCodes.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.code.replace('+', '').includes(q.replace('+', ''))
    );
  }, [search]);

  const borderClass = error
    ? 'border-danger'
    : focused
      ? 'border-brand-accent'
      : 'border-gray-200';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label ? <Text className="text-gray-700 text-sm font-medium mb-1.5">{label}</Text> : null}

      <View
        className={`bg-white border ${borderClass} rounded-xl px-2 ${disabled ? 'opacity-60' : ''}`}
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        {/* Country code selector */}
        <Pressable
          onPress={() => !disabled && setOpen(true)}
          disabled={disabled}
          className="flex-row items-center gap-1 py-3 px-2 active:opacity-70">
          <Text style={{ fontSize: 18 }}>{selectedCountry.flag}</Text>
          <Text className="text-gray-900 text-base font-semibold" style={{ writingDirection: 'ltr' }}>
            {selectedCountry.code}
          </Text>
          <Text className="text-note text-xs">▾</Text>
        </Pressable>

        <View className="w-px self-stretch my-2 bg-line" />

        <TextInput
          value={national}
          onChangeText={handleNumberChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          className="flex-1 py-3 px-2 text-base text-gray-900"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
        />
      </View>

      {error && errorText ? <Text className="text-danger text-xs mt-1">{errorText}</Text> : null}

      {/* Country picker modal */}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => {
            setOpen(false);
            setSearch('');
          }}>
          <Pressable
            className="bg-white rounded-t-3xl px-4 pt-4"
            style={{ maxHeight: '80%' }}
            onPress={(e) => e.stopPropagation()}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-secondary text-lg font-bold">
                {isRTL ? 'اختر الدولة' : 'Select country'}
              </Text>
              <Pressable onPress={() => setOpen(false)} className="p-1 active:opacity-60">
                <CloseIcon size={22} color="#5c5e61" />
              </Pressable>
            </View>

            <View className="flex-row items-center bg-cream rounded-xl px-3 mb-2">
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={isRTL ? 'ابحث عن بلد أو رمز…' : 'Search country or code…'}
                placeholderTextColor="#9ca3af"
                className="flex-1 py-3 text-base text-gray-900"
                style={{ textAlign: isRTL ? 'right' : 'left' }}
                autoFocus
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item: CountryCode, i) => `${item.code}-${item.country}-${i}`}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text className="text-note text-center py-6">{isRTL ? 'لا نتائج' : 'No results'}</Text>
              }
              renderItem={({ item }) => {
                const active = item.code === dialCode;
                return (
                  <Pressable
                    onPress={() => handleSelectCode(item.code)}
                    className={`flex-row items-center gap-3 py-3 px-2 rounded-xl active:bg-cream ${
                      active ? 'bg-primary-50' : ''
                    }`}>
                    <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                    <Text className="flex-1 text-secondary text-base font-medium">{item.country}</Text>
                    <Text className="text-note text-sm" style={{ writingDirection: 'ltr' }}>
                      {item.code}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
