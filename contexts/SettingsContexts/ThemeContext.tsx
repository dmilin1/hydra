import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useContext, useEffect, useRef } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import Themes, { DEFAULT_THEME, Theme, ThemeData } from "../../constants/Themes";
import { SubscriptionsContext } from "../SubscriptionsContext";
import KeyStore from "../../utils/KeyStore";

const initialThemeContext = {
  currentTheme: "dark" as string,
  setCurrentTheme: (_: string) => {},
  theme: Themes["dark"] as (typeof Themes)[keyof typeof Themes],
  cantUseTheme: (_: string) => false,
};

export const ThemeContext = createContext(initialThemeContext);

function getMergedCustomTheme(themeName: string) {
  const customThemes = KeyStore.getString("customThemes");
  if (!customThemes) return Themes.dark;
  const parsed = JSON.parse(customThemes);
  const custom = parsed[themeName];
  if (!custom) return Themes.dark;
  const combinedTheme = {
    ...Themes.dark,
    ...custom,
  };
  return combinedTheme;
}

export function saveCustomTheme(themeData: ThemeData): void {
  const storedThemes = KeyStore.getString("customThemes");
  const themes = storedThemes ? JSON.parse(storedThemes) : {};
  const newTheme = { ...themeData, postColorTint: DEFAULT_THEME.postColorTint, isPro: true };
  themes[newTheme.name] = newTheme;
  KeyStore.set("customThemes", JSON.stringify(themes));
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { isPro, purchasesInitialized } = useContext(SubscriptionsContext);
  const [storedCurrentTheme, setStoredTheme] = useMMKVString("theme");
  const temporaryThemeTimeout = useRef<number | null>(null);
  const previousTheme = useRef<string | null>(null);

  const currentTheme = storedCurrentTheme || initialThemeContext.currentTheme;

  function getThemeObject(themeKey: string): Theme {
    const customThemes = KeyStore.getString("customThemes");
    if (customThemes) {
      const parsed = JSON.parse(customThemes);
      if (parsed[themeKey]) {
        return getMergedCustomTheme(themeKey);
      }
    }
    return Themes[themeKey as keyof typeof Themes] || Themes.dark;
  }

  const cantUseTheme = (themeKey: string) =>
    purchasesInitialized &&
    !isPro &&
    getThemeObject(themeKey).isPro;

  const grantThemeTemporarily = (themeKey: string) => {
    if (temporaryThemeTimeout.current) {
      clearTimeout(temporaryThemeTimeout.current);
      temporaryThemeTimeout.current = null;
    }

    if (!cantUseTheme(currentTheme)) {
      previousTheme.current = currentTheme;
    }

    setStoredTheme(themeKey);

    temporaryThemeTimeout.current = setTimeout(() => {
      setStoredTheme(
        previousTheme.current || initialThemeContext.currentTheme
      );
      temporaryThemeTimeout.current = null;
    }, 1000 * 60 * 5);
  };

  const setCurrentTheme = (themeKey: string) => {
    if (cantUseTheme(themeKey)) {
      grantThemeTemporarily(themeKey);
    } else {
      setStoredTheme(themeKey);
    }
  };

  let themeObj = getThemeObject(currentTheme);

  useEffect(() => {
    setStatusBarStyle(themeObj.statusBar);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        theme: themeObj,
        cantUseTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function t(...styles: (ViewStyle | TextStyle | ImageStyle)[]) {
  return Object.assign({}, ...styles);
}
