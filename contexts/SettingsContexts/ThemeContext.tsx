import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import Themes, {
  DEFAULT_THEME,
  CustomTheme,
  NEW_CUSTOM_THEME,
} from "../../constants/Themes";
import { SubscriptionsContext } from "../SubscriptionsContext";
import { getCustomTheme } from "../../db/functions/CustomThemes";

const initialThemeContext = {
  currentTheme: DEFAULT_THEME.key,
  setCurrentTheme: (_: string) => {},
  theme: DEFAULT_THEME,
  baseTheme: DEFAULT_THEME,
  cantUseTheme: (_: string) => false,
  customThemeData: NEW_CUSTOM_THEME,
  setCustomThemeData: (_: CustomTheme) => {},
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const { isPro, purchasesInitialized } = useContext(SubscriptionsContext);
  const [storedCurrentTheme, setStoredTheme] = useMMKVString("theme");
  const [customThemeData, setCustomThemeData] = useState(
    initialThemeContext.customThemeData,
  );
  const temporaryThemeTimeout = useRef<number | null>(null);
  const previousTheme = useRef<string | null>(null);

  const currentTheme = storedCurrentTheme ?? initialThemeContext.currentTheme;

  const cantUseTheme = (themeKey: string) => {
    return (
      purchasesInitialized &&
      !isPro &&
      (!(themeKey in Themes) ||
        (themeKey in Themes && Themes[themeKey as keyof typeof Themes].isPro))
    );
  };

  const grantThemeTemporarily = (themeKey: string) => {
    if (temporaryThemeTimeout.current) {
      clearTimeout(temporaryThemeTimeout.current);
      temporaryThemeTimeout.current = null;
    }

    if (!cantUseTheme(currentTheme)) {
      previousTheme.current = currentTheme;
    }

    setStoredTheme(themeKey);

    temporaryThemeTimeout.current = setTimeout(
      () => {
        setStoredTheme(
          previousTheme.current || initialThemeContext.currentTheme,
        );
        temporaryThemeTimeout.current = null;
      },
      1000 * 60 * 5,
    );
  };

  const setCurrentTheme = (themeKey: string) => {
    if (cantUseTheme(themeKey)) {
      grantThemeTemporarily(themeKey);
    } else {
      setStoredTheme(themeKey);
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
        currentTheme,
        setCurrentTheme,
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

export function t(...styles: (ViewStyle | TextStyle | ImageStyle)[]) {
  return Object.assign({}, ...styles);
}
