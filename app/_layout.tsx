import '../global.css';
import '../i18n';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-native-reanimated';

import { CompareTray } from '@/components/compare/compare-tray';
import { StatusModalProvider } from '@/components/feedback/status-modal';
import { ToastProvider } from '@/components/feedback/toast';
import { FontProvider } from '@/components/font-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnboardingGate } from '@/hooks/use-onboarding-gate';
import { setUnauthorizedHandler } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { hydrateCompare, setupComparePersistence } from '@/store/compare-persist';
import { clearCredentials, hydrateAuth } from '@/store/persist';
import { store } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  // First-run gate: redirects new installs to the onboarding carousel and keeps
  // an opaque cover up until the (async) "seen" check resolves.
  const booting = useOnboardingGate();

  useEffect(() => {
    hydrateAuth();
    hydrateCompare();
    setupComparePersistence();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearCredentials();
      queryClient.clear();
      router.replace('/(auth)/login' as Href);
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <FontProvider>
        <ToastProvider>
        <StatusModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false, animation: 'none', gestureEnabled: false }}
              />
              <Stack.Screen
                name="(auth)"
                options={{ headerShown: false, presentation: 'modal' }}
              />
              <Stack.Screen name="property/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="agent/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="projects/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="projects/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="faq" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="contact" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="interested-buyer" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="rental-service" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="search" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="holiday-homes" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="blogs/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="blogs/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="compare" options={{ headerShown: false, animation: 'slide_from_right' }} />
            </Stack>
            <CompareTray />
            <StatusBar style="auto" />
            {booting ? (
              <View
                pointerEvents="none"
                style={[styles.cover, { backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }]}>
                <Image
                  source={require('../assets/images/splash-icon.png')}
                  style={styles.coverIcon}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </ThemeProvider>
        </StatusModalProvider>
        </ToastProvider>
        </FontProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  cover: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  coverIcon: { width: 200, height: 200 },
});
