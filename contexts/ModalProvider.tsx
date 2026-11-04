import { useState, ReactNode, useRef, useEffect, useMemo } from "react";
import { Animated, StyleSheet } from "react-native";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { ModalContext } from "./ModalContext";

export function ModalProvider({ children }: React.PropsWithChildren) {
  const [modal, setModal] = useState<ReactNode>(null);
  const { height } = useSafeAreaFrame();
  const modalPosition = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Keeps the closed sheet off-screen when the window resizes (iPhone Duo fold)
    if (!modal) modalPosition.setValue(height);
  }, [height]);

  useEffect(() => {
    Animated.spring(modalPosition, {
      toValue: modal ? 0 : height,
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
      {children}
      <Animated.View
        pointerEvents={modal ? "auto" : "none"}
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
    </ModalContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
