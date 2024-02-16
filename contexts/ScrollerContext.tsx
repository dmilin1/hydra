import { createContext, useState } from 'react';
import { ImageStyle, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';


const initialScrollerContext = {
    scrollDisabled: false,
    setScrollDisabled: (disabled: boolean) => {},
};

export const ScrollerContext = createContext(initialScrollerContext);

export function ScrollerProvider({ children }: React.PropsWithChildren) {
    const [scrollDisabled, setScrollDisabled] = useState(initialScrollerContext.scrollDisabled);

    return (
        <ScrollerContext.Provider value={{
            scrollDisabled,
            setScrollDisabled,
        }}>
            {children}
        </ScrollerContext.Provider>
    );
}
