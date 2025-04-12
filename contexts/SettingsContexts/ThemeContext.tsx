import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useContext, useEffect } from "react";
import { Alert, ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import Themes from "../../constants/Themes";
import { SubscriptionsContext } from "../SubscriptionsContext";
const initialThemeContext = {
  currentTheme: "dark" as keyof typeof Themes,
  setCurrentTheme: (_: keyof typeof Themes) => {},
  theme: Themes["dark"] as (typeof Themes)[keyof typeof Themes],
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { isPro, purchasesInitialized } = useContext(SubscriptionsContext);
  const [storedCurrentTheme, setStoredTheme] = useMMKVString("theme");

  const currentTheme = (
    storedCurrentTheme && storedCurrentTheme in Themes
      ? storedCurrentTheme
      : initialThemeContext.currentTheme
  ) as keyof typeof Themes;

  const cantUseTheme = (theme: keyof typeof Themes) => {
    return purchasesInitialized && !isPro && Themes[theme].isPro;
  };

  const grantThemeTemporarily = (theme: keyof typeof Themes) => {
    const oldTheme = currentTheme;
    setStoredTheme(theme);
    Alert.alert(
      "Hydra Pro Theme",
      "You can use this theme for 5 minutes to try it out. Upgrade to Hydra Pro to keep using it.",
      [{ text: "OK" }],
    );
    if (!Themes[oldTheme].isPro) {
      setTimeout(() => {
        setStoredTheme(oldTheme);
      }, 1_000 * 10);
    }
  };

  const setCurrentTheme = (theme: keyof typeof Themes) => {
    if (cantUseTheme(theme)) {
      grantThemeTemporarily(theme);
    } else {
      setStoredTheme(theme);
    }
  };

  useEffect(() => {
    setStatusBarStyle(Themes[currentTheme].statusBar);
  }, [currentTheme]);

  useEffect(() => {
    if (cantUseTheme(currentTheme)) {
      setStoredTheme(initialThemeContext.currentTheme);
    }
  }, [purchasesInitialized, isPro]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        theme: Themes[currentTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function t(...styles: (ViewStyle | TextStyle | ImageStyle)[]) {
  return Object.assign({}, ...styles);
}
