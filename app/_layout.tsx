import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <>
      {/* Keep the splash screen open until the assets have loaded. In the future, we should just support async font loading with a native version of font-display. */}
      {!loaded && <SplashScreen />}
      {loaded && <RootLayoutNav />}
    </>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs>
          <Tabs.Screen
            name="(tabs)/posts"
            options={{
              title: 'Posts',
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="(tabs)/inbox"
            options={{
              title: 'Inbox',
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="[...missing]"
            options={{
              headerShown: false,
              href: null
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              headerShown: false,
              href: null
            }}
          />
        </Tabs>
      </ThemeProvider>
    </>
  );
}