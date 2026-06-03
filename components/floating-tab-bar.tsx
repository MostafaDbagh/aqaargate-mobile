import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Floating pill tab bar — the active tab expands into a brand-orange pill with
 * an icon + label, while the rest sit as plain circular icons. Matches the
 * reference shape but keeps our own tabs/labels (Home, Buy, Rent, VIP, Agents).
 *
 * Rendered as a non-absolute bottom bar so React Navigation reserves its height
 * and screen content is never overlapped.
 */

const BAR_BG = '#e9eaec';
const ACTIVE_BG = '#f1913d'; // brand primary
const INACTIVE_ICON = '#8e9197'; // --note-2
const ACTIVE_FG = '#ffffff';
const ITEM_SIZE = 50;
const ICON_SIZE = 24;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.title === 'string' ? options.title : route.name;
          const isFocused = state.index === index;
          const color = isFocused ? ACTIVE_FG : INACTIVE_ICON;
          const icon = options.tabBarIcon?.({ focused: isFocused, color, size: ICON_SIZE });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              if (process.env.EXPO_OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.item, isFocused ? styles.itemActive : styles.itemInactive]}>
              {icon}
              {isFocused ? (
                <Text numberOfLines={1} style={styles.label}>
                  {label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingTop: 8,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BAR_BG,
    borderRadius: 34,
    padding: 6,
    gap: 4,
    shadowColor: '#2c2e33',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  item: {
    height: ITEM_SIZE,
    borderRadius: ITEM_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  itemInactive: {
    width: ITEM_SIZE,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  itemActive: {
    paddingHorizontal: 18,
    gap: 8,
    backgroundColor: ACTIVE_BG,
    shadowColor: ACTIVE_BG,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    color: ACTIVE_FG,
    fontSize: 14,
    fontWeight: '600',
  },
});
