import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  align?: 'start' | 'center';
};

export function SectionHeader({ title, subtitle, align = 'start' }: Props) {
  const alignment = align === 'center' ? 'items-center' : 'items-start';
  const textAlign = align === 'center' ? 'text-center' : '';
  return (
    <View className={`px-5 mb-4 ${alignment}`}>
      <Text className={`text-secondary text-2xl font-extrabold ${textAlign}`}>
        {title}
      </Text>
      {subtitle ? (
        <Text className={`text-text text-sm mt-1 ${textAlign}`}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
