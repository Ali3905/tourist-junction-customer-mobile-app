import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import GlobalProvider from '@/context/GlobalProvider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />

        <Stack.Screen name="(modals)/drivers_all" options={{ headerShadowVisible: false, headerTitle: "Drivers for you", headerTitleAlign: "center" }} />
        <Stack.Screen name='(modals)/hire_vehicles' options={{ headerShadowVisible: false, headerTitle: "Hire Vehicles", headerTitleAlign: "center" }} />
        <Stack.Screen name='(modals)/technician_support' options={{ headerShadowVisible: false, headerTitle: "Technician Support", headerTitleAlign: "center" }} />
        <Stack.Screen name='(modals)/bus_tickets' options={{ headerShadowVisible: false, headerTitle: "Bus Tickets", headerTitleAlign: "center" }} />
        <Stack.Screen name='(modals)/holiday_yatra' options={{ headerShadowVisible: false, headerTitle: "Holiday Yatra", headerTitleAlign: "center" }} />
      </Stack>
    </GlobalProvider>
  );
}
