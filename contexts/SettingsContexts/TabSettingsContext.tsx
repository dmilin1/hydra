import { createContext } from "react";
import { useMMKVBoolean } from "react-native-mmkv";

const initialValues = {
  showUsername: true,
  hideTabsOnScroll: false,
};

const initialTabSettingsContext = {
  ...initialValues,
  toggleShowUsername: (_newValue?: boolean) => {},
  toggleHideTabsOnScroll: (_newValue?: boolean) => {},
};

export const TabSettingsContext = createContext(initialTabSettingsContext);

export function TabSettingsProvider({ children }: React.PropsWithChildren) {
  const [storedShowUsername, setShowUsername] = useMMKVBoolean("showUsername");
  const showUsername = storedShowUsername ?? initialValues.showUsername;

  const [storedHideTabsOnScroll, setHideTabsOnScroll] =
    useMMKVBoolean("hideTabsOnScroll");
  const hideTabsOnScroll =
    storedHideTabsOnScroll ?? initialValues.hideTabsOnScroll;

  return (
    <TabSettingsContext.Provider
      value={{
        showUsername: showUsername ?? initialValues.showUsername,
        toggleShowUsername: (newValue = !showUsername) =>
          setShowUsername(newValue),
        hideTabsOnScroll,
        toggleHideTabsOnScroll: (newValue = !hideTabsOnScroll) =>
          setHideTabsOnScroll(newValue),
      }}
    >
      {children}
    </TabSettingsContext.Provider>
  );
}
