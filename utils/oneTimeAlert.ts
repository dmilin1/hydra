import { Alert } from "react-native";
import KeyStore from "./KeyStore";

export function oneTimeAlert(
  key: string,
  ...args: Parameters<typeof Alert.alert>
) {
  const hasShown = KeyStore.getBoolean(key);
  if (hasShown) return false;
  Alert.alert(...args);
  KeyStore.set(key, true);
  return true;
}
