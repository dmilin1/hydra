import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useContext, useEffect, useRef } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import Themes from "../../constants/Themes";
import { SubscriptionsContext } from "../SubscriptionsContext";
const initialThemeContext = {
  currentTheme: "dark" as keyof typeof Themes,
  setCurrentTheme: (_: keyof typeof Themes) => {},
  theme: Themes["dark"] as (typeof Themes)[keyof typeof Themes],
  cantUseTheme: (_: keyof typeof Themes) => false,
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { isPro, purchasesInitialized } = useContext(SubscriptionsContext);
  const [storedCurrentTheme, setStoredTheme] = useMMKVString("theme");
  const temporaryThemeTimeout = useRef<NodeJS.Timeout | null>(null);

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
    if (!Themes[oldTheme].isPro) {
      temporaryThemeTimeout.current = setTimeout(
        () => {
          setStoredTheme(oldTheme);
          temporaryThemeTimeout.current = null;
        },
        1_000 * 60 * 5,
      );
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
    if (
      purchasesInitialized &&
      !temporaryThemeTimeout.current &&
      cantUseTheme(currentTheme)
    ) {
      setStoredTheme(initialThemeContext.currentTheme);
    }
  }, [purchasesInitialized, isPro]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setCurrentTheme,
        theme: Themes[currentTheme],
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
