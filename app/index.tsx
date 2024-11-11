// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh works
// on web.
import "@expo/metro-runtime";
import "expo-dev-client";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Tabs from "./tabs";
import { AccountProvider } from "../contexts/AccountContext";
import { InboxProvider } from "../contexts/InboxContext";
import { ModalProvider } from "../contexts/ModalContext";
import { SettingsProvider } from "../contexts/SettingsContexts";
import { SubredditProvider } from "../contexts/SubredditContext";

LogBox.ignoreLogs([
  "Require cycle: ",
  "Constants.manifest has been deprecated in favor of Constants.expoConfig.",
  `Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.`,
]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SettingsProvider>
          <AccountProvider>
            <ActionSheetProvider>
              <InboxProvider>
                <ModalProvider>
                  <SubredditProvider>
                    <>{loaded && <Tabs />}</>
                  </SubredditProvider>
                </ModalProvider>
              </InboxProvider>
            </ActionSheetProvider>
          </AccountProvider>
        </SettingsProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

registerRootComponent(RootLayout);
