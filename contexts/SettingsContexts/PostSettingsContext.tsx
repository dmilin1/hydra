import { createContext } from "react";
import { useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";

const initialValues = {
  postCompactMode: false,
  subredditAtTop: false,
  showSubredditIcon: true,
  postTitleLength: 2,
  postTextLength: 3,
  blurSpoilers: true,
  blurNSFW: true,
};

const initialPostSettingsContext = {
  ...initialValues,
  togglePostCompactMode: (_newValue?: boolean) => {},
  toggleSubredditAtTop: (_newValue?: boolean) => {},
  toggleSubredditIcon: (_newValue?: boolean) => {},
  changePostTitleLength: (_newValue: number) => {},
  changePostTextLength: (_newValue: number) => {},
  toggleBlurSpoilers: (_newValue?: boolean) => {},
  toggleBlurNSFW: (_newValue?: boolean) => {},
};

export const PostSettingsContext = createContext(initialPostSettingsContext);

export function PostSettingsProvider({ children }: React.PropsWithChildren) {
  const [postCompactMode, setPostCompactMode] =
    useMMKVBoolean("postCompactMode");
  const [subredditAtTop, setSubredditAtTop] = useMMKVBoolean("subredditAtTop");
  const [showSubredditIcon, setShowSubredditIcon] =
    useMMKVBoolean("showSubredditIcon");
  const [postTitleLength, setPostTitleLength] =
    useMMKVNumber("postTitleLength");
  const [postTextLength, setPostTextLength] = useMMKVNumber("postTextLength");
  const [blurSpoilers, setBlurSpoilers] = useMMKVBoolean("blurSpoilers");
  const [blurNSFW, setBlurNSFW] = useMMKVBoolean("blurNSFW");

  return (
    <PostSettingsContext.Provider
      value={{
        postCompactMode: postCompactMode ?? initialValues.postCompactMode,
        togglePostCompactMode: (newValue = !postCompactMode) =>
          setPostCompactMode(newValue),

        subredditAtTop: subredditAtTop ?? initialValues.subredditAtTop,
        toggleSubredditAtTop: (newValue = !subredditAtTop) =>
          setSubredditAtTop(newValue),

        showSubredditIcon: showSubredditIcon ?? initialValues.showSubredditIcon,
        toggleSubredditIcon: (newValue = !showSubredditIcon) =>
          setShowSubredditIcon(newValue),

        postTitleLength: postTitleLength ?? initialValues.postTitleLength,
        changePostTitleLength: (newValue: number) =>
          setPostTitleLength(newValue),

        postTextLength: postTextLength ?? initialValues.postTextLength,
        changePostTextLength: (newValue: number) => setPostTextLength(newValue),

        blurSpoilers: blurSpoilers ?? initialValues.blurSpoilers,
        toggleBlurSpoilers: (newValue = !blurSpoilers) =>
          setBlurSpoilers(newValue),

        blurNSFW: blurNSFW ?? initialValues.blurNSFW,
        toggleBlurNSFW: (newValue = !blurNSFW) => setBlurNSFW(newValue),
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
