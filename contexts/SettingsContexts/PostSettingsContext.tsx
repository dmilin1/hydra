import { createContext } from "react";
import { useMMKVBoolean, useMMKVNumber } from "react-native-mmkv";

const initialValues = {
  postCompactMode: false,
  subredditAtTop: false,
  showSubredditIcon: true,
  postTitleLength: 2,
  postTextLength: 3,
  linkDescriptionLength: 10,
  showPostFlair: true,
  blurSpoilers: true,
  blurNSFW: true,
  showPostSummary: true,
  autoPlayVideos: true,
  liveTextInteraction: false,
  tapToCollapsePost: true,
};

const initialPostSettingsContext = {
  ...initialValues,
  togglePostCompactMode: (_newValue?: boolean) => {},
  toggleSubredditAtTop: (_newValue?: boolean) => {},
  toggleSubredditIcon: (_newValue?: boolean) => {},
  changePostTitleLength: (_newValue: number) => {},
  changePostTextLength: (_newValue: number) => {},
  changeLinkDescriptionLength: (_newValue: number) => {},
  toggleShowPostFlair: (_newValue?: boolean) => {},
  toggleBlurSpoilers: (_newValue?: boolean) => {},
  toggleBlurNSFW: (_newValue?: boolean) => {},
  toggleShowPostSummary: (_newValue?: boolean) => {},
  toggleAutoPlayVideos: (_newValue?: boolean) => {},
  toggleLiveTextInteraction: (_newValue?: boolean) => {},
  toggleTapToCollapsePost: (_newValue?: boolean) => {},
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

  const [storedShowPostFlair, setShowPostFlair] =
    useMMKVBoolean("showPostFlair");
  const showPostFlair = storedShowPostFlair ?? initialValues.showPostFlair;

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

  const [storedliveTextInteraction, setliveTextInteraction] = useMMKVBoolean(
    "liveTextInteraction",
  );
  const liveTextInteraction =
    storedliveTextInteraction ?? initialValues.liveTextInteraction;

  const [storedTapToCollapsePost, setTapToCollapsePost] =
    useMMKVBoolean("tapToCollapsePost");
  const tapToCollapsePost =
    storedTapToCollapsePost ?? initialValues.tapToCollapsePost;

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

        showPostFlair: showPostFlair ?? initialValues.showPostFlair,
        toggleShowPostFlair: (newValue = !showPostFlair) =>
          setShowPostFlair(newValue),

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

        liveTextInteraction:
          liveTextInteraction ?? initialValues.liveTextInteraction,
        toggleLiveTextInteraction: (newValue = !liveTextInteraction) =>
          setliveTextInteraction(newValue),

        tapToCollapsePost: tapToCollapsePost ?? initialValues.tapToCollapsePost,
        toggleTapToCollapsePost: (newValue = !tapToCollapsePost) =>
          setTapToCollapsePost(newValue),
      }}
    >
      {children}
    </PostSettingsContext.Provider>
  );
}
