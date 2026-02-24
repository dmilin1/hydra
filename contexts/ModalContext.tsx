import { ReactNode, createContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

type ModalContextType = {
  setModal: (modal?: ReactNode) => void;
};

const initialModalContext: ModalContextType = {
  setModal: () => {},
};

export const ModalContext = createContext(initialModalContext);

export function ModalProvider({ children }: React.PropsWithChildren) {
  const [modal, setModal] = useState<ReactNode>(null);

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
      {modal && <View style={styles.modalContainer}>{modal}</View>}
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
    zIndex: 1000,
  },
});
