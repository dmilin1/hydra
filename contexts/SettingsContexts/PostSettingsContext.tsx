import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

type PostSettingsContextType = {
  postCompactMode: boolean;
  togglePostCompactMode: (newValue?: boolean) => void;
  subredditAtTop: boolean;
  toggleSubredditAtTop: (newValue?: boolean) => void;
  showSubredditIcon: boolean;
  toggleSubredditIcon: (newValue?: boolean) => void;
  postTitleLength: number;
  changePostTitleLength: (newValue: number) => void;
  postTextLength: number;
  changePostTextLength: (newValue: number) => void;
  blurSpoilers: boolean;
  toggleBlurSpoilers: (newValue?: boolean) => void;
  blurNSFW: boolean;
  toggleBlurNSFW: (newValue?: boolean) => void;
};

const initialValues = {
  postCompactMode: false,
  subredditAtTop: false,
  showSubredditIcon: true,
  postTitleLength: 2,
  postTextLength: 3,
  blurSpoilers: true,
  blurNSFW: true,
};

const initialPostSettingsContext: PostSettingsContextType = {
  ...initialValues,
  togglePostCompactMode: () => {},
  toggleSubredditAtTop: () => {},
  toggleSubredditIcon: () => {},
  changePostTitleLength: () => {},
  changePostTextLength: () => {},
  toggleBlurSpoilers: () => {},
  toggleBlurNSFW: () => {},
};

type SettingsLoaders = {
  [Key in keyof typeof initialValues]: {
    key: Key;
    setFn: React.Dispatch<React.SetStateAction<(typeof initialValues)[Key]>>;
  };
}[keyof typeof initialValues][];

export const PostSettingsContext = createContext(initialPostSettingsContext);

export function PostSettingsProvider({ children }: React.PropsWithChildren) {
  const [postCompactMode, setPostCompactMode] = useState(
    initialPostSettingsContext.postCompactMode,
  );
  const [subredditAtTop, setSubredditAtTop] = useState(
    initialPostSettingsContext.subredditAtTop,
  );
  const [showSubredditIcon, setShowSubredditIcon] = useState(
    initialPostSettingsContext.showSubredditIcon,
  );
  const [postTitleLength, setPostTitleLength] = useState(
    initialPostSettingsContext.postTitleLength,
  );
  const [postTextLength, setPostTextLength] = useState(
    initialPostSettingsContext.postTextLength,
  );
  const [blurSpoilers, setBlurSpoilers] = useState(
    initialPostSettingsContext.blurSpoilers,
  );
  const [blurNSFW, setBlurNSFW] = useState(initialPostSettingsContext.blurNSFW);

  const togglePostCompactMode = (newValue = !postCompactMode) => {
    setPostCompactMode((prev) => !prev);
    AsyncStorage.setItem("postCompactMode", JSON.stringify(newValue));
  };

  const toggleSubredditAtTop = (newValue = !subredditAtTop) => {
    setSubredditAtTop((prev) => !prev);
    AsyncStorage.setItem("subredditAtTop", JSON.stringify(newValue));
  };

  const toggleSubredditIcon = (newValue = !showSubredditIcon) => {
    setShowSubredditIcon((prev) => !prev);
    AsyncStorage.setItem("showSubredditIcon", JSON.stringify(newValue));
  };

  const changePostTitleLength = (newValue: number) => {
    setPostTitleLength(newValue);
    AsyncStorage.setItem("postTitleLength", JSON.stringify(newValue));
  };

  const changePostTextLength = (newValue: number) => {
    setPostTextLength(newValue);
    AsyncStorage.setItem("postTextLength", JSON.stringify(newValue));
  };

  const toggleBlurSpoilers = (newValue = !blurSpoilers) => {
    setBlurSpoilers((prev) => !prev);
    AsyncStorage.setItem("blurSpoilers", JSON.stringify(newValue));
  };

  const toggleBlurNSFW = (newValue = !blurNSFW) => {
    setBlurNSFW((prev) => !prev);
    AsyncStorage.setItem("blurNSFW", JSON.stringify(newValue));
  };

  const loadSavedData = () => {
    const settingsLoaders: SettingsLoaders = [
      {
        key: "postCompactMode",
        setFn: setPostCompactMode,
      },
      {
        key: "subredditAtTop",
        setFn: setSubredditAtTop,
      },
      {
        key: "showSubredditIcon",
        setFn: setShowSubredditIcon,
      },
      {
        key: "postTitleLength",
        setFn: setPostTitleLength,
      },
      {
        key: "postTextLength",
        setFn: setPostTextLength,
      },
      {
        key: "blurSpoilers",
        setFn: setBlurSpoilers,
      },
      {
        key: "blurNSFW",
        setFn: setBlurNSFW,
      },
    ];
    settingsLoaders.forEach(({ key, setFn }) => {
      AsyncStorage.getItem(key).then((str) => {
        if (str) {
          let val = JSON.parse(str);
          if (typeof initialPostSettingsContext[key] === "number") {
            val = Number(val);
          }
          setFn(JSON.parse(val));
        }
      });
    });
  };

  useEffect(() => loadSavedData(), []);

  return (
    <PostSettingsContext.Provider
      value={{
        postCompactMode,
        togglePostCompactMode,
        subredditAtTop,
        toggleSubredditAtTop,
        showSubredditIcon,
        toggleSubredditIcon,
        postTitleLength,
        changePostTitleLength,
        postTextLength,
        changePostTextLength,
        blurSpoilers,
        toggleBlurSpoilers,
        blurNSFW,
        toggleBlurNSFW,
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
