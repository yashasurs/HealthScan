import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { DeviceEventEmitter } from 'react-native';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

function InitialLayout() {
  const { isAuthenticated, loading, logoutAndResetLaunch } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Listen for authentication errors
  useEffect(() => {
    const authErrorListener = DeviceEventEmitter.addListener('authError', async (error) => {
      console.log('Authentication error detected, logging out and redirecting to landing');
      await logoutAndResetLaunch();
      // Reset to first launch state to show landing page
      router.replace('/landing');
    });

    return () => {
      authErrorListener.remove();
    };
  }, [logoutAndResetLaunch, router]);

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const inAuthGroup = segments[0] === '(tabs)';
    console.log('Layout navigation logic - isAuthenticated:', isAuthenticated, 'inAuthGroup:', inAuthGroup, 'segments:', segments);

    // Protect authenticated routes
    if (!isAuthenticated && inAuthGroup) {
      console.log('Unauthenticated user in protected route - redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, segments, loading]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="record-detail" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
