import { createContext, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Themes from '../constants/Themes';


const initialTheme: keyof typeof Themes = 'dark';

export const ThemeContext = createContext(Themes[initialTheme]);

export function ThemeProvider({ children }: React.PropsWithChildren) {
    const [theme, setTheme] = useState<typeof initialTheme>(initialTheme);

    return (
        <ThemeContext.Provider value={{
            ...Themes[theme],
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function t(style1: ViewStyle | TextStyle | ImageStyle, style2: any) {
    return { ...style1, ...style2 };
}