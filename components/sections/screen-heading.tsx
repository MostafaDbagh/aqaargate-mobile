import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
};

// Canonical page-level hero heading (contact, rental-service, interested-buyer,
// faq, …): 22px title + 13px description. Padding-less so callers control the
// surrounding container; RTL-aware (the app aligns manually, no I18nManager flip).
export function ScreenHeading({ title, subtitle }: Props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  return (
    <View>
      <Text
        className="text-secondary text-[22px] font-extrabold tracking-tight"
        style={{ textAlign }}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-text text-[13px] mt-2 leading-[20px]" style={{ textAlign }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
