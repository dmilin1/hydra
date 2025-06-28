import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  swipeAnywhereToNavigate: false,
};

const initialGesturesContext = {
  ...initialValues,
  toggleSwipeAnywhereToNavigate: (_newValue?: boolean) => {},
};

export const GesturesContext = createContext(initialGesturesContext);

export function GesturesProvider({ children }: React.PropsWithChildren) {
  const [storedSwipeAnywhereToNavigate, setSwipeAnywhereToNavigate] =
    useMMKVBoolean("swipeAnywhereToNavigate");
  const swipeAnywhereToNavigate =
    storedSwipeAnywhereToNavigate ?? initialValues.swipeAnywhereToNavigate;

  return (
    <GesturesContext.Provider
      value={{
        swipeAnywhereToNavigate,
        toggleSwipeAnywhereToNavigate: (newValue = !swipeAnywhereToNavigate) =>
          setSwipeAnywhereToNavigate(newValue),
      }}
    >
      {children}
    </GesturesContext.Provider>
  );
}
