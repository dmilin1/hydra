import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import Themes, {
  DEFAULT_THEME,
  CustomTheme,
  NEW_CUSTOM_THEME,
} from "../../constants/Themes";
import { SubscriptionsContext } from "../SubscriptionsContext";
import { getCustomTheme } from "../../db/functions/CustomThemes";
import { useColorScheme } from "react-native";

const initialThemeContext = {
  systemColorScheme: "light" as "light" | "dark",
  lightTheme: DEFAULT_THEME.key,
  darkTheme: DEFAULT_THEME.key,
  currentTheme: DEFAULT_THEME.key,
  setCurrentTheme: (_: string, _colorScheme: "light" | "dark" = "light") => {},
  useDifferentDarkTheme: false,
  setUseDifferentDarkTheme: (_: boolean) => {},
  theme: DEFAULT_THEME,
  baseTheme: DEFAULT_THEME,
  cantUseTheme: (_: string) => false,
  customThemeData: NEW_CUSTOM_THEME,
  setCustomThemeData: (_: CustomTheme) => {},
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { isPro, purchasesInitialized } = useContext(SubscriptionsContext);

  const systemColorScheme = useColorScheme() ?? "light";

  const [storedCurrentTheme, setStoredTheme] = useMMKVString("theme");
  const [storedDarkTheme, setStoredDarkTheme] = useMMKVString("darkTheme");

  const [customThemeData, setCustomThemeData] = useState(
    initialThemeContext.customThemeData,
  );

  const [storedUseDifferentDarkTheme, setUseDifferentDarkTheme] =
    useMMKVBoolean("useDifferentDarkTheme");
  const useDifferentDarkTheme =
    storedUseDifferentDarkTheme ?? initialThemeContext.useDifferentDarkTheme;

  const temporaryThemeTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [temporaryTheme, setTemporaryTheme] = useState<string | null>(null);

  const lightTheme = storedCurrentTheme ?? initialThemeContext.currentTheme;
  const darkTheme = storedDarkTheme ?? initialThemeContext.currentTheme;
  const currentTheme =
    temporaryTheme ??
    (systemColorScheme === "light" || !useDifferentDarkTheme
      ? storedCurrentTheme
      : storedDarkTheme) ??
    initialThemeContext.currentTheme;

  const cantUseTheme = (themeKey: string) => {
    return (
      purchasesInitialized &&
      !isPro &&
      (!(themeKey in Themes) ||
        (themeKey in Themes && Themes[themeKey as keyof typeof Themes].isPro))
    );
  };

  const clearTemporaryTheme = () => {
    if (temporaryThemeTimeout.current) {
      clearTimeout(temporaryThemeTimeout.current);
      temporaryThemeTimeout.current = null;
    }
    setTemporaryTheme(null);
  };

  const grantThemeTemporarily = (themeKey: string) => {
    clearTemporaryTheme();
    setTemporaryTheme(themeKey);
    temporaryThemeTimeout.current = setTimeout(
      () => clearTemporaryTheme(),
      1000 * 60 * 5,
    );
  };

  const setCurrentTheme = (
    themeKey: string,
    colorScheme: "light" | "dark" | undefined = useDifferentDarkTheme
      ? systemColorScheme
      : undefined,
  ) => {
    clearTemporaryTheme();
    if (cantUseTheme(themeKey)) {
      if (colorScheme === systemColorScheme) {
        grantThemeTemporarily(themeKey);
      }
    } else {
      if (!colorScheme || colorScheme === "light") {
        setStoredTheme(themeKey);
      } else {
        setStoredDarkTheme(themeKey);
      }
    }
  };

  let theme = DEFAULT_THEME;
  let baseTheme = DEFAULT_THEME;
  if (currentTheme in Themes) {
    theme = Themes[currentTheme as keyof typeof Themes];
    baseTheme = Themes[currentTheme as keyof typeof Themes];
  } else {
    const customTheme = getCustomTheme(currentTheme);
    if (customTheme && customTheme.extends in Themes) {
      theme = {
        ...Themes[customTheme.extends as keyof typeof Themes],
        ...customTheme,
        isPro: true,
      };
    }
  }
  theme = { ...theme, ...customThemeData };

  useEffect(() => {
    setStatusBarStyle(theme.statusBar);
  }, [theme.statusBar]);

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
        systemColorScheme,
        lightTheme,
        darkTheme,
        currentTheme,
        setCurrentTheme,
        useDifferentDarkTheme,
        setUseDifferentDarkTheme,
        theme,
        baseTheme,
        cantUseTheme,
        customThemeData,
        setCustomThemeData,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
