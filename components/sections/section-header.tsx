import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
};

// Bayut-style section header: compact title (18px), small muted subtitle.
export function SectionHeader({ title, subtitle, align = 'start' }: Props) {
  const alignClass = align === 'center' ? 'items-center' : 'items-start';
  const textClass = align === 'center' ? 'text-center' : '';
  return (
    <View className={`px-5 mb-3 ${alignClass}`}>
      <Text
        className={`text-secondary text-[18px] font-bold leading-[22px] ${textClass}`}
        style={{ letterSpacing: -0.3 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className={`text-text text-[12px] mt-1 leading-[16px] ${textClass}`}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
