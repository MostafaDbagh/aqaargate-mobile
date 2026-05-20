import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FaqItem = { key: string };
type FaqSection = { titleKey: string; items: FaqItem[] };

const SECTIONS: FaqSection[] = [
  {
    titleKey: 'overview',
    items: [
      { key: 'whyChooseOurService' },
      { key: 'howSecureAreYourServices' },
      { key: 'customerSupportService' },
      { key: 'howCanIUpdateMyAccountInformation' },
    ],
  },
  {
    titleKey: 'costsAndPayments',
    items: [
      { key: 'howDoYouCalculateFees' },
      { key: 'howDoIPayMyInvoices' },
      { key: 'areThereAnyHiddenFees' },
      { key: 'whatIsTheRefundProcedure' },
      { key: 'isThereFinancialOrAccountingSupport' },
    ],
  },
  {
    titleKey: 'safetyAndSecurity',
    items: [
      { key: 'whatLanguagesDoesYourServiceSupport' },
      { key: 'whatAreTheSafetyFeatures' },
      { key: 'howCanIRequestNewFeatures' },
      { key: 'isMyDataProtected' },
      { key: 'havingTechnicalIssues' },
    ],
  },
];

export default function FaqScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const [openKey, setOpenKey] = useState<string | null>(
    SECTIONS[0].items[0].key
  );

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenKey((current) => (current === key ? null : key));
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView edges={['top']} className="bg-white">
        <View
          className="flex-row items-center px-4 pt-2 pb-3 bg-white"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('faqScreen.back')}
            className="w-10 h-10 rounded-full items-center justify-center active:bg-cream">
            <Ionicons
              name={isRTL ? 'chevron-forward' : 'chevron-back'}
              size={22}
              color="#2c2e33"
            />
          </Pressable>
          <Text className="flex-1 text-secondary text-[17px] font-extrabold tracking-tight px-2">
            {t('faqScreen.headerTitle')}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2 pb-4">
          <Text className="text-secondary text-[22px] font-extrabold tracking-tight">
            {t('faqScreen.title')}
          </Text>
          <Text className="text-text text-[13px] mt-1">
            {t('faqScreen.subtitle')}
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.titleKey} className="px-5 mb-4">
            <Text className="text-secondary text-[15px] font-extrabold tracking-tight mb-2">
              {t(`faqScreen.sections.${section.titleKey}`)}
            </Text>

            <View
              className="bg-white border border-line rounded-2xl overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 1,
              }}>
              {section.items.map((item, index) => {
                const open = openKey === item.key;
                const last = index === section.items.length - 1;
                return (
                  <View
                    key={item.key}
                    className={last ? '' : 'border-b border-line'}>
                    <Pressable
                      onPress={() => toggle(item.key)}
                      className="flex-row items-center px-4 py-3 active:bg-cream"
                      style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                      <Text
                        className={`flex-1 text-[14px] font-semibold ${
                          open ? 'text-primary' : 'text-secondary'
                        }`}
                        style={{ textAlign: isRTL ? 'right' : 'left' }}>
                        {t(`faqScreen.questions.${item.key}.title`)}
                      </Text>
                      <Ionicons
                        name={open ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={open ? '#f1913d' : '#a8abae'}
                      />
                    </Pressable>

                    {open ? (
                      <View className="px-4 pb-4">
                        <FaqAnswer
                          text={t(`faqScreen.questions.${item.key}.answer`)}
                          isRTL={isRTL}
                        />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function FaqAnswer({ text, isRTL }: { text: string; isRTL: boolean }) {
  const paragraphs = text.split('\n\n');
  return (
    <View>
      {paragraphs.map((para, idx) => (
        <Fragment key={idx}>
          <Text
            className="text-text text-[13px] leading-5"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {para}
          </Text>
          {idx < paragraphs.length - 1 ? <View className="h-2" /> : null}
        </Fragment>
      ))}
    </View>
  );
}
