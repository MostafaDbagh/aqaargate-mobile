import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
  /** Live count rendered next to the title in muted note color, e.g. "Holiday Homes (12)". */
  count?: number;
  /** Trailing element on the title row (e.g. a "View all" link). Forces a row layout. */
  action?: ReactNode;
};

// Canonical in-content section header (home sections, agents, rent, …).
// Bayut-style: compact 18px title, 13px muted description, 20px gap to content.
// RTL-aware — the app never force-flips layout via I18nManager, so we align manually.
export function SectionHeader({ title, subtitle, align = 'start', count, action }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const centered = align === 'center' && !action;
  const textAlign = centered ? 'center' : isRTL ? 'right' : 'left';

  const titleBlock = (
    <View className={centered ? 'items-center' : undefined} style={{ flexShrink: 1 }}>
      <Text
        className="text-secondary text-[18px] font-extrabold leading-[22px]"
        style={{ letterSpacing: -0.3, textAlign }}>
        {title}
        {count != null && count > 0 ? (
          <Text className="text-note text-[15px] font-bold"> ({count})</Text>
        ) : null}
      </Text>
      {subtitle ? (
        <Text className="text-text text-[13px] mt-1 leading-[18px]" style={{ textAlign }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View className={`px-5 mb-5 ${centered ? 'items-center' : ''}`}>
      {action ? (
        <View
          className="flex-row items-center justify-between gap-3"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {titleBlock}
          {action}
        </View>
      ) : (
        titleBlock
      )}
    </View>
  );
}
