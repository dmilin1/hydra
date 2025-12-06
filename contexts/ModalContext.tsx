import {
  ReactNode,
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

type ModalContextType = {
  setModal: (modal?: ReactNode) => void;
};

const initialModalContext: ModalContextType = {
  setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);

const SCREEN_HEIGHT = Dimensions.get("window").height;

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
      {children}
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "relative",
    zIndex: 1000,
  },
});
