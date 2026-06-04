import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';

import { useCompare } from '@/apis/hooks';

// Tab screens render a floating tab bar at the very bottom, so lift the tray to
// clear it there; on pushed (stack) screens it can sit lower.
const TAB_ROUTES = new Set(['/', '/property-list', '/rent', '/vip', '/agents']);

// Routes where the tray would be noise or overlap their own bottom bars
// (the property detail screen has its own sticky contact action bar).
function isHidden(pathname: string): boolean {
  if (pathname === '/compare' || pathname === '/onboarding') return true;
  if (pathname.startsWith('/property/')) return true;
  return /(login|register|otp|password|profile)/.test(pathname);
}

const trayShadow: ViewStyle = {
  shadowColor: '#2c2e33',
  shadowOpacity: 0.18,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 8,
};

export function CompareTray() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  // Static device insets — avoids needing a root SafeAreaProvider above the
  // navigator (which would defer the Stack mount and break first-render nav).
  const insetBottom = initialWindowMetrics?.insets?.bottom ?? 0;
  const { items, count, max, clear } = useCompare();

  if (count === 0 || isHidden(pathname)) return null;

  const onTab = TAB_ROUTES.has(pathname);
  const bottom = onTab ? insetBottom + 86 : insetBottom + 14;

  return (
    <View style={{ position: 'absolute', left: 16, right: 16, bottom }} pointerEvents="box-none">
      <Pressable
        onPress={() => router.push('/compare' as never)}
        accessibilityRole="button"
        accessibilityLabel={t('compare.compareNow', { count })}
        className="bg-secondary rounded-2xl px-3 py-2.5 active:opacity-90"
        style={[
          { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 },
          trayShadow,
        ]}>
        {/* Thumbnails of the selected listings */}
        <View
          className="flex-row"
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          {items.map((it, i) => (
            <View
              key={it._id}
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: '#2c2e33',
                backgroundColor: '#4b4d52',
                marginLeft: !isRTL && i > 0 ? -10 : 0,
                marginRight: isRTL && i > 0 ? -10 : 0,
              }}>
              {it.images?.[0]?.url ? (
                <Image
                  source={{ uri: it.images[0].url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : null}
            </View>
          ))}
        </View>

        <View className="flex-1">
          <Text
            className="text-white text-[14px] font-extrabold"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('compare.compareNow', { count })}
          </Text>
          <Text
            className="text-white/60 text-[11px] font-medium"
            style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('compare.selectedCount', { count, max })}
          </Text>
        </View>

        <View className="bg-primary rounded-full w-9 h-9 items-center justify-center">
          <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={18} color="#ffffff" />
        </View>

        <Pressable
          onPress={clear}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('compare.clearAll')}
          className="w-7 h-7 items-center justify-center rounded-full active:bg-white/10">
          <Ionicons name="close" size={18} color="#ffffff" />
        </Pressable>
      </Pressable>
    </View>
  );
}
