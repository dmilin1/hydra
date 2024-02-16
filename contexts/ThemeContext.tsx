import { createContext, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Themes from '../constants/Themes';


const initialThemeContext = {
    currentTheme: 'dark' as keyof typeof Themes,
    setCurrentTheme: (theme: keyof typeof Themes) => {},    
    theme: Themes['dark'] as typeof Themes[keyof typeof Themes],
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
    const [currentTheme, setCurrentTheme] = useState(initialThemeContext.currentTheme);

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setCurrentTheme,
            theme: Themes[currentTheme],
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function t(...styles: (ViewStyle | TextStyle | ImageStyle)[]) {
    return Object.assign({}, ...styles);
}