import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

type Status = '' | 'For Sale' | 'For Rent';

type Props = {
  onSearch: (next: { keyword: string; status: Status }) => void;
};

const TABS: { key: Status; labelKey: string }[] = [
  { key: '', labelKey: 'hero.forAll' },
  { key: 'For Sale', labelKey: 'hero.forSale' },
  { key: 'For Rent', labelKey: 'hero.forRent' },
];

export function Hero({ onSearch }: Props) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<Status>('');

  const submit = () => onSearch({ keyword: keyword.trim(), status });

  return (
    <View className="bg-brand px-5 pt-14 pb-8">
      <Text className="text-white text-2xl font-bold leading-8">
        {t('hero.title')}
      </Text>
      <Text className="text-white/70 text-sm mt-2">{t('hero.subtitle')}</Text>

      <View className="flex-row mt-5 gap-2">
        {TABS.map((tab) => {
          const active = status === tab.key;
          return (
            <Pressable
              key={tab.key || 'all'}
              onPress={() => setStatus(tab.key)}
              className={`px-4 py-2 rounded-full ${
                active ? 'bg-brand-accent' : 'bg-white/10'
              }`}>
              <Text className={`text-sm ${active ? 'text-white font-semibold' : 'text-white/80'}`}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center mt-4 bg-white rounded-2xl overflow-hidden">
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('hero.searchPlaceholder')}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={submit}
          returnKeyType="search"
          className="flex-1 px-4 py-3 text-base text-gray-900"
        />
        <Pressable
          onPress={submit}
          className="bg-brand-accent px-4 py-3 flex-row items-center gap-2"
          accessibilityLabel={t('hero.searchButton')}>
          <Ionicons name="search" size={18} color="#fff" />
          <Text className="text-white font-semibold">{t('hero.searchButton')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
