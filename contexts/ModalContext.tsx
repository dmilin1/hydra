import { ReactNode, createContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';
import { t } from './ThemeContext';

export type Account = {
    username: string,
    password: string,
}

type AccountContextType =  {
    setModal: (modal?: ReactNode) => void,
}

const initialModalContext: AccountContextType = {
    setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function ModalProvider({ children }: React.PropsWithChildren) {
    const [modal, setModal] = useState<ReactNode>(null);
    const modalPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        Animated.spring(modalPosition, {
            toValue: modal ? 0 : SCREEN_HEIGHT,
            bounciness: 2,
            useNativeDriver: true,
        }).start();
    }, [modal]);

    return (
        <ModalContext.Provider value={{
            setModal,
        }}>
            <Animated.View style={t(styles.modalContainer, {
                transform: [{
                    translateY: modalPosition,
                }],
            })}>
                {modal}
            </Animated.View>
            {children}
        </ModalContext.Provider>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        position: 'relative',
        zIndex: 1000,
    },
});