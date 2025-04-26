import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  showUsername: true,
};

const initialTabSettingsContext = {
  ...initialValues,
  toggleShowUsername: (_newValue?: boolean) => {},
};

export const TabSettingsContext = createContext(initialTabSettingsContext);

export function TabSettingsProvider({ children }: React.PropsWithChildren) {
  const [storedShowUsername, setShowUsername] = useMMKVBoolean("showUsername");
  const showUsername = storedShowUsername ?? initialValues.showUsername;

  return (
    <TabSettingsContext.Provider
      value={{
        showUsername: showUsername ?? initialValues.showUsername,
        toggleShowUsername: (newValue = !showUsername) =>
          setShowUsername(newValue),
      }}
    >
      {children}
    </TabSettingsContext.Provider>
  );
}
