import { Ionicons } from '@expo/vector-icons';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Global success / failure status modal — mobile mirror of the web
 * `components/modals/GlobalStatusModal.jsx`. A single centered dialog with a
 * coloured status icon, title, message, an optional highlighted chip (e.g. the
 * email an account was created for) and one or two action buttons.
 *
 * Exposed app-wide via `useStatusModal()` (like `useToast`) so any flow —
 * registration, submitting a review, messaging an agent — can clearly report
 * its outcome to the user.
 */

type StatusType = 'success' | 'error';

export type StatusButton = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

export type StatusConfig = {
  type: StatusType;
  title: string;
  message: string;
  /** Optional highlighted chip value, e.g. the email an account was created for. */
  email?: string;
  /** Label shown before the email value; defaults to globalStatus.accountCreatedFor. */
  emailLabel?: string;
  /** Custom buttons; when omitted a single dismiss button is shown. */
  buttons?: StatusButton[];
};

type StatusModalContextValue = {
  show: (config: StatusConfig) => void;
  success: (config: Omit<StatusConfig, 'type'>) => void;
  error: (config: Omit<StatusConfig, 'type'>) => void;
  hide: () => void;
};

const StatusModalContext = createContext<StatusModalContextValue | null>(null);

const VISUAL: Record<
  StatusType,
  {
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    chipBg: string;
    chipBorder: string;
    /** Soft same-hue ring behind the icon disc. */
    halo: string;
  }
> = {
  // Match web's GlobalStatusModal palette: green check for success, amber for warnings.
  success: {
    color: '#25c55b',
    icon: 'checkmark-sharp',
    chipBg: '#f0fdf4',
    chipBorder: '#bbf7d0',
    halo: 'rgba(37,197,91,0.14)',
  },
  error: {
    color: '#f59e0b',
    icon: 'warning',
    chipBg: '#fffbeb',
    chipBorder: '#fed7aa',
    halo: 'rgba(245,158,11,0.14)',
  },
};

export function StatusModalProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [config, setConfig] = useState<StatusConfig | null>(null);

  const hide = useCallback(() => setConfig(null), []);
  const show = useCallback((c: StatusConfig) => setConfig(c), []);
  const success = useCallback(
    (c: Omit<StatusConfig, 'type'>) => setConfig({ ...c, type: 'success' }),
    []
  );
  const error = useCallback(
    (c: Omit<StatusConfig, 'type'>) => setConfig({ ...c, type: 'error' }),
    []
  );

  const visible = config != null;
  const v = config ? VISUAL[config.type] : VISUAL.success;

  // Entrance animation: spring the card in (scale + fade) and fade the backdrop.
  // Plain Animated (not Reanimated) keeps it dependency-free; the Animated.Views
  // are styled via `style` only (no className) so NativeWind never has to wrap an
  // Animated component.
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 18,
      stiffness: 230,
      mass: 0.9,
    }).start();
  }, [visible, anim]);
  const cardScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  // Default to a single dismiss button when the caller doesn't supply any.
  const buttons: StatusButton[] =
    config?.buttons && config.buttons.length > 0
      ? config.buttons
      : [
          {
            label: config?.type === 'error' ? t('globalStatus.close') : t('globalStatus.continue'),
            variant: 'primary',
          },
        ];
  const multi = buttons.length > 1;

  // Root overlay (not a native <Modal>) so the Android hardware back button —
  // previously handled by Modal's onRequestClose — still dismisses the dialog.
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      hide();
      return true;
    });
    return () => sub.remove();
  }, [visible, hide]);

  const handlePress = (b: StatusButton) => {
    // Close first so navigation triggered by the button isn't stacked under us.
    hide();
    b.onPress?.();
  };

  // Stable context value — the callbacks are all memoized, so consumers that key
  // effects/memos off the returned object (or its identity) don't re-run on every
  // provider render (which happens each time the dialog opens/closes).
  const ctx = useMemo(() => ({ show, success, error, hide }), [show, success, error, hide]);

  return (
    <StatusModalContext.Provider value={ctx}>
      {children}
      {/*
        Root-level absolute overlay — deliberately NOT a react-native <Modal>.
        A <Modal> spawns a separate UIKit window; presenting that window while a
        navigation modal (the (auth) flow) or another <Modal> (message-agent) is
        mid-dismiss makes iOS drop the presentation yet leave a transparent,
        touch-capturing zombie window on top — the screen freezes with no dialog
        shown and nothing is clickable. A plain overlay lives in the root window,
        so there's no present-while-dismissing race: it waits behind the
        dismissing modal and is revealed once that modal slides away.
      */}
      {visible ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              zIndex: 50,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              backgroundColor: 'rgba(15,23,42,0.55)',
              opacity: anim,
            },
          ]}>
          <Animated.View
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: '#ffffff',
              borderRadius: 28,
              paddingHorizontal: 28,
              paddingTop: 32,
              paddingBottom: 24,
              alignItems: 'center',
              shadowColor: '#0f172a',
              shadowOpacity: 0.18,
              shadowRadius: 30,
              shadowOffset: { width: 0, height: 18 },
              elevation: 12,
              opacity: anim,
              transform: [{ scale: cardScale }],
            }}>
            {/* Status icon — solid colour disc floating on a soft same-hue halo */}
            <View
              style={{
                width: 96,
                height: 96,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
              }}>
              <View
                style={{
                  position: 'absolute',
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  backgroundColor: v.halo,
                }}
              />
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: v.color,
                  shadowColor: v.color,
                  shadowOpacity: 0.45,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8,
                }}>
                <Ionicons name={v.icon} size={40} color="#ffffff" />
              </View>
            </View>

            {/* Title */}
            <Text
              className="text-secondary text-[22px] font-extrabold text-center mb-1.5"
              style={{ letterSpacing: -0.4 }}>
              {config?.title}
            </Text>

            {/* Message */}
            <Text
              className="text-[15px] text-center mb-5"
              style={{ color: '#64748b', lineHeight: 22 }}>
              {config?.message}
            </Text>

            {/* Optional email chip */}
            {config?.email ? (
              <View
                style={{
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  borderRadius: 14,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 22,
                  backgroundColor: v.chipBg,
                  borderWidth: 1,
                  borderColor: v.chipBorder,
                }}>
                <Ionicons name="mail-outline" size={15} color={v.color} />
                <Text
                  style={{
                    color: v.color,
                    fontSize: 13,
                    fontWeight: '700',
                    flexShrink: 1,
                    textAlign: 'center',
                  }}>
                  {`${config.emailLabel ?? t('globalStatus.accountCreatedFor')} ${config.email}`}
                </Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View
              className="w-full gap-3"
              style={{ flexDirection: multi ? (isRTL ? 'row-reverse' : 'row') : 'column' }}>
              {buttons.map((b, i) => {
                const primary = (b.variant ?? 'primary') === 'primary';
                const primaryBg = config?.type === 'error' ? '#f1913d' : v.color;
                return (
                  <Pressable
                    key={`${b.label}-${i}`}
                    onPress={() => handlePress(b)}
                    accessibilityRole="button"
                    className={`rounded-2xl py-4 items-center justify-center active:opacity-90 ${
                      multi ? 'flex-1' : 'w-full'
                    } ${primary ? '' : 'border border-line bg-white'}`}
                    style={
                      primary
                        ? {
                            backgroundColor: primaryBg,
                            shadowColor: primaryBg,
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 6 },
                            elevation: 4,
                          }
                        : undefined
                    }>
                    <Text
                      className={`text-[15px] font-bold ${primary ? 'text-white' : 'text-text'}`}>
                      {b.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      ) : null}
    </StatusModalContext.Provider>
  );
}

export function useStatusModal() {
  const ctx = useContext(StatusModalContext);
  if (!ctx) throw new Error('useStatusModal must be used inside <StatusModalProvider>');
  return ctx;
}
