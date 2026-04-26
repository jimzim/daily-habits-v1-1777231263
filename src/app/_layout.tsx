import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { PreferencesProvider, usePreferences } from '@/stores/PreferencesContext';
import { ToastProvider } from '@/stores/ToastContext';
import { HabitsProvider } from '@/stores/HabitsContext';
import { ToastViewport } from '@/components/Toast';
import { useColorSchemeResolved } from '@/hooks/useTheme';
import { DB_NAME, initializeSchema } from '@/db/schema';
import { getColors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <SQLiteProvider databaseName={DB_NAME} onInit={initializeSchema}>
            <ToastProvider>
              <HabitsProvider>
                <ThemedShell />
              </HabitsProvider>
            </ToastProvider>
          </SQLiteProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedShell() {
  const { ready: prefsReady } = usePreferences();
  const scheme = useColorSchemeResolved();
  const colors = getColors(scheme);

  const onLayoutRoot = useCallback(async () => {
    if (prefsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch {
        /* noop */
      }
    }
  }, [prefsReady]);

  useEffect(() => {
    if (prefsReady) {
      onLayoutRoot();
    }
  }, [prefsReady, onLayoutRoot]);

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={onLayoutRoot}
    >
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="habit/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Habit',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
            }}
          />
          <Stack.Screen
            name="about"
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'About',
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.textPrimary,
            }}
          />
        </Stack>
        <ToastViewport />
      </BottomSheetModalProvider>
    </View>
  );
}
