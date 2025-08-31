import { Alert } from "react-native";
import KeyStore from "./KeyStore";

export function oneTimeAlert(key: string, title: string, message: string) {
  const hasShown = KeyStore.getBoolean(key);
  if (hasShown) return;
  Alert.alert(title, message);
  KeyStore.set(key, true);
}
