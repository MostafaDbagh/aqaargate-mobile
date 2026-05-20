import '../global.css';
import '../i18n';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import 'react-native-reanimated';

import { ToastProvider } from '@/components/feedback/toast';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setUnauthorizedHandler } from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import { clearCredentials, hydrateAuth } from '@/store/persist';
import { store } from '@/store/store';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    hydrateAuth();
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
        <ToastProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(auth)"
                options={{ headerShown: false, presentation: 'modal' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
