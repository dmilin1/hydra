import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

type PostSettingsContextType = {
  compactMode: boolean;
  toggleCompactMode: (newValue?: boolean) => void;
};

const initialPostSettingsContext: PostSettingsContextType = {
  compactMode: false,
  toggleCompactMode: () => {},
};

export const PostSettingsContext = createContext(initialPostSettingsContext);

export function PostSettingsProvider({ children }: React.PropsWithChildren) {
  const [compactMode, setCompactMode] = useState(
    initialPostSettingsContext.compactMode,
  );

  const toggleCompactMode = (newValue = !compactMode) => {
    setCompactMode((prev) => !prev);
    AsyncStorage.setItem("postCompactMode", JSON.stringify(newValue));
  };

  useEffect(() => {
    AsyncStorage.getItem("postCompactMode").then((postCompactMode) => {
      if (postCompactMode) {
        setCompactMode(JSON.parse(postCompactMode));
      }
    });
  }, []);

  return (
    <PostSettingsContext.Provider
      value={{
        compactMode,
        toggleCompactMode,
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
