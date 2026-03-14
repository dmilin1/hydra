import { Platform, Share } from "react-native";
import KeyStore from "./KeyStore";
import RedditURL from "./RedditURL";

export const SHARE_OLD_REDDIT_LINKS_KEY = "shareOldRedditLinks";
export const SHARE_OLD_REDDIT_LINKS_DEFAULT = false;

function getShareableURL(url: string) {
  const shouldShareOldRedditLinks =
    KeyStore.getBoolean(SHARE_OLD_REDDIT_LINKS_KEY) ??
    SHARE_OLD_REDDIT_LINKS_DEFAULT;

  if (!shouldShareOldRedditLinks) {
    return url;
  }

  try {
    const redditURL = new RedditURL(url);
    return redditURL.toString().replace(
      "https://www.reddit.com",
      "https://old.reddit.com",
    );
  } catch (_) {
    return url;
  }
}

export default async function shareURL(url: string, title?: string) {
  const shareableURL = getShareableURL(url);

  await Share.share(
    Platform.OS === "android"
      ? {
          message: shareableURL,
          title,
        }
      : {
          url: shareableURL,
          message: title,
        },
  );
}
