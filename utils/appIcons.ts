import { Platform } from "react-native";

import {
  androidAliasSuffix,
  appIconKeyFromNativeName,
} from "../constants/appIcons";
import {
  getAppIconAlias,
  setAppIconAlias,
  supportsAlternateIcons,
} from "../modules/app-icons";

export { supportsAlternateIcons };

/**
 * Translates an icon key into the platform's idea of an icon name. iOS addresses
 * icons by asset-catalog name (the key itself); Android addresses them by
 * activity-alias suffix.
 */
function aliasForKey(key: string): string {
  return Platform.OS === "android" ? androidAliasSuffix(key) : key;
}

/** The active icon's key, or null when the stock Hydra icon is in use. */
export function getCurrentAppIcon(): string | null {
  const alias = getAppIconAlias();

  return alias ? appIconKeyFromNativeName(alias) : null;
}

/** Pass null to restore the stock icon. */
export async function setAppIcon(key: string | null): Promise<void> {
  await setAppIconAlias(key === null ? null : aliasForKey(key));
}
