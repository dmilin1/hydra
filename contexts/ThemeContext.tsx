import { createContext, useEffect, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Themes from '../constants/Themes';
import { setStatusBarStyle } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';


const initialThemeContext = {
    currentTheme: 'dark' as keyof typeof Themes,
    setCurrentTheme: (theme: keyof typeof Themes) => {},    
    theme: Themes['dark'] as typeof Themes[keyof typeof Themes],
};

export const ThemeContext = createContext(initialThemeContext);

export function ThemeProvider({ children }: React.PropsWithChildren) {
    const [currentTheme, setCurrentTheme] = useState(initialThemeContext.currentTheme);

    useEffect((() => {
        AsyncStorage.getItem('theme').then(theme => {
            if (theme && theme in Themes) {
                setCurrentTheme(theme as keyof typeof Themes);
            }
        });
    }), []);

    useEffect(() => {
        setStatusBarStyle(Themes[currentTheme].statusBar);
        AsyncStorage.setItem('theme', currentTheme);
    }, [currentTheme]);

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