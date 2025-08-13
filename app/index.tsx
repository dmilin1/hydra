// `@expo/metro-runtime` MUST be the first import to ensure Fast Refresh works
// on web.
import "@expo/metro-runtime";
import "expo-dev-client";

import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as Sentry from "@sentry/react-native";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { registerRootComponent } from "expo";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import React, { useEffect, useState } from "react";
import { AppState, LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze } from "react-native-screens";

import Tabs from "./tabs";
import SubscribeToHydra from "../components/Modals/SubscribeToHydra";
import { AccountProvider } from "../contexts/AccountContext";
import { InboxProvider } from "../contexts/InboxContext";
import { MediaViewerProvider } from "../contexts/MediaViewerContext";
import { ModalProvider } from "../contexts/ModalContext";
import NavigationProvider from "../contexts/NavigationContext";
import { SettingsProvider } from "../contexts/SettingsContexts";
import { SubredditProvider } from "../contexts/SubredditContext";
import { SubscriptionsProvider } from "../contexts/SubscriptionsContext";
import db from "../db";
import { doDBMaintenance } from "../db/functions/Maintenance";
import migrations from "../drizzle/migrations";
import { ERROR_REPORTING_STORAGE_KEY } from "../pages/SettingsPage/Privacy";
import KeyStore from "../utils/KeyStore";
import { TabScrollProvider } from "../contexts/TabScrollContext";
import { StartupModalProvider } from "../contexts/StartupModalContext";
import { modifyStat, Stat } from "../db/functions/Stats";

LogBox.ignoreLogs([
  "Require cycle: ",
  "Constants.manifest has been deprecated in favor of Constants.expoConfig.",
  `Constants.platform.ios.model has been deprecated in favor of expo-device's Device.modelName property. This API will be removed in SDK 45.`,
]);

// Default to true if not set
const reportingAllowed =
  KeyStore.getBoolean(ERROR_REPORTING_STORAGE_KEY) !== false;

Sentry.init({
  dsn: "https://0a53bc725058aa44bf7aa771f5bcda05@o4508377723174912.ingest.us.sentry.io/4508377726582784",
  debug: false,
  enabled: !__DEV__ && reportingAllowed,

  // Disable app hang tracking because it's bugged when asking for permissions
  // https://stackoverflow.com/a/79085057
  enableAppHangTracking: false,
});

SplashScreen.preventAutoHideAsync();

// Tells non visble tabs and screens to not rerender in the background
enableFreeze(true);

function RootLayout() {
  const { success: migrationsComplete, error } = useMigrations(db, migrations);

  const [fontsLoaded, _fontsError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [dbMaintenanceDone, setDbMaintenanceDone] = useState(false);

  const doDBMaintenanceAsync = async () => {
    await doDBMaintenance();
    setDbMaintenanceDone(true);
  };

  useEffect(() => {
    if (migrationsComplete) {
      doDBMaintenanceAsync();
      modifyStat(Stat.APP_LAUNCHES, 1);
      modifyStat(Stat.APP_FOREGROUNDS, 1);
      AppState.addEventListener("change", (state) => {
        if (state === "active") {
          modifyStat(Stat.APP_FOREGROUNDS, 1);
        }
      });
    }
  }, [migrationsComplete]);

  return (
    migrationsComplete &&
    fontsLoaded &&
    dbMaintenanceDone && (
      <SafeAreaProvider>
        <AccountProvider>
          <SubscriptionsProvider>
            <SettingsProvider>
              <TabScrollProvider>
                <NavigationProvider>
                  <ActionSheetProvider>
                    <InboxProvider>
                      <ModalProvider>
                        <MediaViewerProvider>
                          <SubredditProvider>
                            <StartupModalProvider>
                              <SubscribeToHydra />
                              <Tabs />
                            </StartupModalProvider>
                          </SubredditProvider>
                        </MediaViewerProvider>
                      </ModalProvider>
                    </InboxProvider>
                  </ActionSheetProvider>
                </NavigationProvider>
              </TabScrollProvider>
            </SettingsProvider>
          </SubscriptionsProvider>
        </AccountProvider>
      </SafeAreaProvider>
    )
  );
}

const App = Sentry.wrap(RootLayout);

export default App;

registerRootComponent(App);
