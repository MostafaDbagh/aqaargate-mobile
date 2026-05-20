import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { SectionTitle } from './specs-grid';

// Maps web's supported amenity names → an Ionicons glyph + i18n key suffix.
// Keep keys identical to backend values so translations work cleanly.
const AMENITY_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; translateKey: string }
> = {
  'Solar energy system': { icon: 'sunny-outline', translateKey: 'solarEnergySystem' },
  'Star link internet': { icon: 'wifi-outline', translateKey: 'starLinkInternet' },
  'Fiber internet': { icon: 'wifi-outline', translateKey: 'fiberInternet' },
  'Basic internet': { icon: 'wifi-outline', translateKey: 'basicInternet' },
  Parking: { icon: 'car-outline', translateKey: 'parking' },
  Lift: { icon: 'arrow-up-circle-outline', translateKey: 'lift' },
  'A/C': { icon: 'snow-outline', translateKey: 'ac' },
  Gym: { icon: 'barbell-outline', translateKey: 'gym' },
  'Security cameras': { icon: 'videocam-outline', translateKey: 'securityCameras' },
  Reception: { icon: 'people-outline', translateKey: 'receptionNator' },
  Balcony: { icon: 'sunny-outline', translateKey: 'balcony' },
  'Swimming pool': { icon: 'water-outline', translateKey: 'swimmingPool' },
  'Fire alarms': { icon: 'alert-circle-outline', translateKey: 'fireAlarms' },
};

export function Amenities({ amenities = [] }: { amenities: string[] }) {
  const { t } = useTranslation();
  if (!amenities || amenities.length === 0) return null;

  return (
    <View className="px-5 mt-6">
      <SectionTitle title={t('propertyDetail.amenitiesAndFeatures')} />
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -3 }}>
        {amenities.map((name) => {
          const meta = AMENITY_META[name];
          const label = meta ? t(`amenities.${meta.translateKey}`, name) : name;
          const iconName = meta?.icon ?? 'checkmark-circle-outline';
          return (
            <View key={name} className="w-1/2 p-1">
              <View className="bg-white border border-line rounded-lg flex-row items-center gap-2 px-2.5 py-2.5">
                <View className="w-6 h-6 rounded-md bg-primary-50 items-center justify-center">
                  <Ionicons name={iconName} size={14} color="#f1913d" />
                </View>
                <Text className="text-secondary text-[12px] font-semibold flex-1" numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
