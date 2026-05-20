import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CloseIcon } from './icons/svg-icons';

type Status = '' | 'For Sale' | 'For Rent';

type Props = {
  visible: boolean;
  value: Status;
  onSelect: (next: Status) => void;
  onClose: () => void;
};

const OPTIONS: { key: Status; labelKey: string }[] = [
  { key: '', labelKey: 'hero.forAll' },
  { key: 'For Sale', labelKey: 'hero.forSale' },
  { key: 'For Rent', labelKey: 'hero.forRent' },
];

export function FiltersSheet({ visible, value, onSelect, onClose }: Props) {
  const { t } = useTranslation();
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
        <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
          <Text className="text-brand text-lg font-bold">{t('hero.filtersTitle')}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Close"
            className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100">
            <CloseIcon color="#111827" />
          </Pressable>
        </View>
        <View className="px-5 pb-6 gap-2">
          {OPTIONS.map((opt) => {
            const active = value === opt.key;
            return (
              <Pressable
                key={opt.key || 'all'}
                onPress={() => {
                  onSelect(opt.key);
                  onClose();
                }}
                className={`flex-row items-center justify-between rounded-xl px-4 py-4 border ${
                  active
                    ? 'bg-primary-50 border-primary'
                    : 'bg-white border-line active:bg-cream'
                }`}>
                <Text
                  className={`text-base font-semibold ${
                    active ? 'text-primary' : 'text-secondary'
                  }`}>
                  {t(opt.labelKey)}
                </Text>
                {active ? (
                  <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                ) : (
                  <View className="w-2.5 h-2.5 rounded-full border border-note" />
                )}
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
