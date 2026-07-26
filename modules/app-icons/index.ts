import { requireNativeModule } from "expo-modules-core";

/**
 * Thin wrapper over the native alternate-app-icon APIs. Deliberately knows
 * nothing about Hydra's icons — it speaks in "aliases", which on iOS are asset
 * catalog names and on Android are activity-alias suffixes. utils/appIcons.ts
 * owns the mapping from icon keys to aliases.
 */
type AppIconsModule = {
  supportsAlternateIcons: boolean;
  /** Currently active alias, or null when the primary icon is active. */
  getAppIconAlias: () => string | null;
  /** Pass null to restore the primary icon. Rejects on an unknown alias. */
  setAppIconAlias: (alias: string | null) => Promise<string | null>;
};

const AppIcons = requireNativeModule<AppIconsModule>("AppIcons");

export const supportsAlternateIcons = AppIcons.supportsAlternateIcons;

export function getAppIconAlias(): string | null {
  return AppIcons.getAppIconAlias();
}

export function setAppIconAlias(alias: string | null): Promise<string | null> {
  return AppIcons.setAppIconAlias(alias);
}
