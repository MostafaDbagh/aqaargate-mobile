import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { useCategories } from '@/apis/hooks';
import { CategoryIcon } from '@/components/icons/category-icons';

import { SectionHeader } from './section-header';

// Arabic display names — web uses a hardcoded map for the same purpose.
const PROPERTY_TYPE_AR: Record<string, string> = {
  Apartment: 'شقة',
  'Villa/Farms': 'فيلا/مزرعة',
  Villa: 'فيلا',
  Building: 'بناء',
  Office: 'مكتب',
  Commercial: 'تجاري',
  Land: 'أرض',
  'Holiday Home': 'بيت عطلات',
  Chalet: 'شاليه',
};

type Props = {
  activeName?: string;
  onSelect: (name: string) => void;
};

export function CategoriesSection({ activeName, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: categories = [], isLoading, isError } = useCategories();

  if (isError && categories.length === 0) return null;

  return (
    <View className="bg-cream py-8">
      <SectionHeader
        title={t('categoriesSection.title')}
        subtitle={t('categoriesSection.subtitle')}
      />

      {isLoading ? (
        <View className="h-[140px] items-center justify-center">
          <ActivityIndicator color="#f1913d" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {categories.map((c) => {
            const active = activeName === c.name;
            const label = isAr ? PROPERTY_TYPE_AR[c.name] ?? c.displayName : c.displayName;
            return (
              <Pressable
                key={c.slug}
                onPress={() => onSelect(active ? '' : c.name)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                className={`w-[140px] rounded-2xl border px-3 py-4 items-center ${
                  active
                    ? 'bg-primary border-primary'
                    : 'bg-white border-line active:bg-primary-50'
                }`}
                style={{
                  shadowColor: '#f1913d',
                  shadowOpacity: active ? 0.18 : 0.06,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: active ? 4 : 1,
                }}>
                <View
                  className={`w-14 h-14 rounded-2xl items-center justify-center mb-2 ${
                    active ? 'bg-white/20' : 'bg-primary-50'
                  }`}>
                  <CategoryIcon
                    name={c.name}
                    size={28}
                    color={active ? '#ffffff' : '#f1913d'}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  className={`text-sm font-bold text-center ${
                    active ? 'text-white' : 'text-secondary'
                  }`}>
                  {label}
                </Text>
                <Text
                  className={`text-xs mt-1 ${active ? 'text-white/80' : 'text-text'}`}>
                  {c.count}{' '}
                  {c.count === 1 ? t('common.property') : t('common.properties')}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
