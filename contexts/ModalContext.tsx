import {
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, StyleSheet, View } from "react-native";

type ModalContextType = {
  setModal: (modal?: ReactNode) => void;
};

const initialModalContext: ModalContextType = {
  setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);

export function ModalProvider({ children }: React.PropsWithChildren) {
  const [modal, setModal] = useState<ReactNode>(null);
  const modalPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targetValue = modal ? 0 : 1000;
    Animated.spring(modalPosition, {
      toValue: targetValue,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  }, [modal, modalPosition]);

  /**
   * Since this provider only provides functions, we need to memoize the value
   * or all consumers will re-render when the provider re-renders.
   */
  const value = useMemo(
    () => ({
      setModal,
    }),
    [],
  );

  return (
    <ModalContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        {modal && (
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    translateY: modalPosition,
                  },
                ],
              },
            ]}
          >
            {modal}
          </Animated.View>
        )}
      </View>
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
});
