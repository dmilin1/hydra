import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

type PostSettingsContextType = {
  compactMode: boolean;
  toggleCompactMode: (newValue?: boolean) => void;
  subredditAtTop: boolean;
  toggleSubredditAtTop: (newValue?: boolean) => void;
  showSubredditIcon: boolean;
  toggleSubredditIcon: (newValue?: boolean) => void;
};

const initialPostSettingsContext: PostSettingsContextType = {
  compactMode: false,
  toggleCompactMode: () => {},
  subredditAtTop: false,
  toggleSubredditAtTop: () => {},
  showSubredditIcon: true,
  toggleSubredditIcon: () => {},
};

export const PostSettingsContext = createContext(initialPostSettingsContext);

export function PostSettingsProvider({ children }: React.PropsWithChildren) {
  const [compactMode, setCompactMode] = useState(
    initialPostSettingsContext.compactMode,
  );
  const [subredditAtTop, setSubredditAtTop] = useState(
    initialPostSettingsContext.subredditAtTop,
  );
  const [showSubredditIcon, setShowSubredditIcon] = useState(
    initialPostSettingsContext.showSubredditIcon,
  );

  const toggleCompactMode = (newValue = !compactMode) => {
    setCompactMode((prev) => !prev);
    AsyncStorage.setItem("postCompactMode", JSON.stringify(newValue));
  };

  const toggleSubredditAtTop = (newValue = !compactMode) => {
    setSubredditAtTop((prev) => !prev);
    AsyncStorage.setItem("subredditAtTop", JSON.stringify(newValue));
  };

  const toggleSubredditIcon = (newValue = !showSubredditIcon) => {
    setShowSubredditIcon((prev) => !prev);
    AsyncStorage.setItem("showSubredditIcon", JSON.stringify(newValue));
  };

  const loadSavedData = () => {
    [
      {
        key: "postCompactMode",
        setFn: setCompactMode,
      },
      {
        key: "subredditAtTop",
        setFn: setSubredditAtTop,
      },
      {
        key: "showSubredditIcon",
        setFn: setShowSubredditIcon,
      },
    ].forEach(({ key, setFn }) => {
      AsyncStorage.getItem(key).then((val) => {
        if (val) {
          setFn(JSON.parse(val));
        }
      });
    });
  };

  useEffect(() => loadSavedData(), []);

  return (
    <PostSettingsContext.Provider
      value={{
        compactMode,
        toggleCompactMode,
        subredditAtTop,
        toggleSubredditAtTop,
        showSubredditIcon,
        toggleSubredditIcon,
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
