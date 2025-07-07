import { createContext } from "react";
import { useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";

const initialValues = {
  postCompactMode: false,
  subredditAtTop: false,
  showSubredditIcon: true,
  postTitleLength: 2,
  postTextLength: 3,
  linkDescriptionLength: 10,
  blurSpoilers: true,
  blurNSFW: true,
  showPostSummary: true,
  autoPlayVideos: true,
};

const initialPostSettingsContext = {
  ...initialValues,
  togglePostCompactMode: (_newValue?: boolean) => {},
  toggleSubredditAtTop: (_newValue?: boolean) => {},
  toggleSubredditIcon: (_newValue?: boolean) => {},
  changePostTitleLength: (_newValue: number) => {},
  changePostTextLength: (_newValue: number) => {},
  changeLinkDescriptionLength: (_newValue: number) => {},
  toggleBlurSpoilers: (_newValue?: boolean) => {},
  toggleBlurNSFW: (_newValue?: boolean) => {},
  toggleShowPostSummary: (_newValue?: boolean) => {},
  toggleAutoPlayVideos: (_newValue?: boolean) => {},
};

export const PostSettingsContext = createContext(initialPostSettingsContext);

export function PostSettingsProvider({ children }: React.PropsWithChildren) {
  const [storedPostCompactMode, setPostCompactMode] =
    useMMKVBoolean("postCompactMode");
  const postCompactMode =
    storedPostCompactMode ?? initialValues.postCompactMode;

  const [storedSubredditAtTop, setSubredditAtTop] =
    useMMKVBoolean("subredditAtTop");
  const subredditAtTop = storedSubredditAtTop ?? initialValues.subredditAtTop;

  const [storedShowSubredditIcon, setShowSubredditIcon] =
    useMMKVBoolean("showSubredditIcon");
  const showSubredditIcon =
    storedShowSubredditIcon ?? initialValues.showSubredditIcon;

  const [storedPostTitleLength, setPostTitleLength] =
    useMMKVNumber("postTitleLength");
  const postTitleLength =
    storedPostTitleLength ?? initialValues.postTitleLength;

  const [storedPostTextLength, setPostTextLength] =
    useMMKVNumber("postTextLength");
  const postTextLength = storedPostTextLength ?? initialValues.postTextLength;

  const [storedLinkDescriptionLength, setLinkDescriptionLength] = useMMKVNumber(
    "linkDescriptionLength",
  );
  const linkDescriptionLength =
    storedLinkDescriptionLength ?? initialValues.linkDescriptionLength;

  const [storedBlurSpoilers, setBlurSpoilers] = useMMKVBoolean("blurSpoilers");
  const blurSpoilers = storedBlurSpoilers ?? initialValues.blurSpoilers;

  const [storedBlurNSFW, setBlurNSFW] = useMMKVBoolean("blurNSFW");
  const blurNSFW = storedBlurNSFW ?? initialValues.blurNSFW;

  const [storedShowPostSummary, setShowPostSummary] =
    useMMKVBoolean("showPostSummary");
  const showPostSummary =
    storedShowPostSummary ?? initialValues.showPostSummary;

  const [storedAutoPlayVideos, setAutoPlayVideos] =
    useMMKVBoolean("autoPlayVideos");
  const autoPlayVideos = storedAutoPlayVideos ?? initialValues.autoPlayVideos;

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

        linkDescriptionLength:
          linkDescriptionLength ?? initialValues.linkDescriptionLength,
        changeLinkDescriptionLength: (newValue: number) =>
          setLinkDescriptionLength(newValue),

        blurSpoilers: blurSpoilers ?? initialValues.blurSpoilers,
        toggleBlurSpoilers: (newValue = !blurSpoilers) =>
          setBlurSpoilers(newValue),

        blurNSFW: blurNSFW ?? initialValues.blurNSFW,
        toggleBlurNSFW: (newValue = !blurNSFW) => setBlurNSFW(newValue),

        showPostSummary: showPostSummary ?? initialValues.showPostSummary,
        toggleShowPostSummary: (newValue = !showPostSummary) =>
          setShowPostSummary(newValue),

        autoPlayVideos: autoPlayVideos ?? initialValues.autoPlayVideos,
        toggleAutoPlayVideos: (newValue = !autoPlayVideos) =>
          setAutoPlayVideos(newValue),
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
