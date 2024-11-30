import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from "@sentry/react-native";
import { PropsWithChildren, useEffect, useState } from "react";

import KeyStore from "../utils/KeyStore";

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export const hasMigratedFromAsyncStorage = KeyStore.getBoolean(
  "hasMigratedFromAsyncStorage",
);

// TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
export async function migrateFromAsyncStorage(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();

  for (const key of keys) {
    try {
      const value = await AsyncStorage.getItem(key);

      if (value != null) {
        if (["true", "false"].includes(value)) {
          KeyStore.set(key, value === "true");
        } else {
          KeyStore.set(key, value);
        }
        AsyncStorage.removeItem(key);
      }
    } catch (e) {
      Sentry.captureException(e);
      throw e;
    }
  }

  KeyStore.set("hasMigratedFromAsyncStorage", true);
}

export default function App({ children }: PropsWithChildren) {
  // TODO: Remove `hasMigratedFromAsyncStorage` after a while (when everyone has migrated)
  const [hasMigrated, setHasMigrated] = useState(hasMigratedFromAsyncStorage);

  const startMigration = async () => {
    try {
      await migrateFromAsyncStorage();
      setHasMigrated(true);
    } catch (e) {
      Sentry.captureException(e);
    }
  };

  useEffect(() => {
    startMigration();
  }, []);

  return hasMigrated ? children : null;
}
