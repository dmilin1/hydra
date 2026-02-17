import {
  RouteProp,
  useNavigation,
  useRoute as useRouteUntyped,
} from "@react-navigation/native";
import { useContext } from "react";

import RedditURL, { PageType } from "./RedditURL";
import { StackParamsList, URLRoutes } from "../app/stack";
import { MediaViewerContext } from "../contexts/MediaViewerContext";
import { StackFutureContext } from "../contexts/StackFutureContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function useRoute<
  Pages extends keyof StackParamsList = keyof StackParamsList,
>() {
  return useRouteUntyped<RouteProp<StackParamsList, Pages>>();
}

type NavFunctionsWithURL = "push" | "replace";

export const PageTypeToNavName: Record<PageType, keyof StackParamsList> = {
  [PageType.HOME]: "Home",
  [PageType.POST_DETAILS]: "PostDetailsPage",
  [PageType.SUBREDDIT]: "PostsPage",
  [PageType.SUBREDDIT_SEARCH]: "SubredditSearchPage",
  [PageType.MULTIREDDIT]: "MultiredditPage",
  [PageType.USER]: "UserPage",
  [PageType.SEARCH]: "SearchPage",
  [PageType.INBOX]: "InboxPage",
  [PageType.MESSAGES]: "MessagesPage",
  [PageType.ACCOUNTS]: "Accounts",
  [PageType.SIDEBAR]: "SidebarPage",
  [PageType.WIKI]: "WikiPage",
  [PageType.SETTINGS]: "SettingsPage",
  [PageType.WEBVIEW]: "WebviewPage",
  [PageType.IMAGE]: "ErrorPage",
  [PageType.UNKNOWN]: "ErrorPage",
};

export function useURLNavigation<
  Pages extends keyof StackParamsList = keyof StackParamsList,
>() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamsList, Pages>>();
  const { clearFuture } = useContext(StackFutureContext);
  const { displayMedia } = useContext(MediaViewerContext);

  const doNavigationAction = async (
    link: string,
    func: NavFunctionsWithURL,
  ) => {
    const redditURL = (
      await new RedditURL(link).resolveURL()
    ).applyPreferredSorts();
    const pageType = redditURL.getPageType();
    const url = redditURL.url;
    const navName = PageTypeToNavName[pageType];

    if (pageType === PageType.IMAGE) {
      displayMedia(url);
    } else {
      navigation[func](navName as URLRoutes, { url });
    }
    clearFuture();
  };

  return {
    ...navigation,
    pushURL: (url: string) => doNavigationAction(url, "push"),
    replaceURL: (url: string) => doNavigationAction(url, "replace"),
    openGallery: (url: string) => navigation.push("GalleryPage", { url }),
  };
}
