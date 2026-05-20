import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { SectionTitle } from './specs-grid';

export function Description({ desc, descAr }: { desc?: string; descAr?: string }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const text = (isAr && descAr) || desc || '';
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.description')} />
      <Text
        className="text-text text-[13px] leading-[20px]"
        numberOfLines={expanded ? undefined : 5}
        style={{ textAlign: isAr ? 'right' : 'left' }}>
        {text}
      </Text>
      {text.length > 240 ? (
        <Pressable onPress={() => setExpanded((v) => !v)} className="mt-1.5 self-start">
          <Text className="text-primary text-[12px] font-bold">
            {expanded ? t('propertyDetail.showLess') : t('propertyDetail.showMore')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Notes({ notes, notesAr }: { notes?: string; notesAr?: string }) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const text = (isAr && notesAr) || notes || '';
  if (!text) return null;

  return (
    <View className="px-5 mt-4">
      <View className="bg-primary-50 border border-primary-200 rounded-xl p-3.5 flex-row gap-2.5">
        <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
          <Text className="text-white text-[13px] font-extrabold">!</Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-secondary text-[11px] font-bold uppercase mb-0.5"
            style={{ letterSpacing: 0.6 }}>
            {t('propertyDetail.notes')}
          </Text>
          <Text
            className="text-text text-[12px] leading-[18px]"
            style={{ textAlign: isAr ? 'right' : 'left' }}>
            {text}
          </Text>
        </View>
      </View>
    </View>
  );
}
