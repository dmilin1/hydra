import { setStatusBarStyle } from "expo-status-bar";
import { createContext, useEffect } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { useMMKVString } from "react-native-mmkv";

import Themes from "../../constants/Themes";

const initialThemeContext = {
  currentTheme: "dark" as keyof typeof Themes,
  setCurrentTheme: (_: keyof typeof Themes) => {},
  theme: Themes["dark"] as (typeof Themes)[keyof typeof Themes],
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [storedCurrentTheme, setCurrentTheme] = useMMKVString("theme");

  const currentTheme = (
    storedCurrentTheme && storedCurrentTheme in Themes
      ? storedCurrentTheme
      : initialThemeContext.currentTheme
  ) as keyof typeof Themes;

  useEffect(() => {
    setStatusBarStyle(Themes[currentTheme].statusBar);
  }, [currentTheme]);

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
