import {
  RouteProp,
  useNavigation as useNavigationUntyped,
  useRoute as useRouteUntyped,
} from "@react-navigation/native";
import { useContext } from "react";

import RedditURL, { PageType } from "./RedditURL";
import { StackParamsList } from "../app/stack";
import { MediaViewerContext } from "../contexts/MediaViewerContext";
import { StackFutureContext } from "../contexts/StackFutureContext";
import { AppNavigationProp, FlexibleNavigationProp } from "./navigationTypes";

export function useNavigation() {
  return useNavigationUntyped<AppNavigationProp>();
}

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
  [PageType.MULTIREDDIT]: "MultiredditPage",
  [PageType.USER]: "UserPage",
  [PageType.SEARCH]: "SearchPage",
  [PageType.INBOX]: "InboxPage",
  [PageType.MESSAGES]: "MessagesPage",
  [PageType.ACCOUNTS]: "Accounts",
  [PageType.SETTINGS]: "SettingsPage",
  [PageType.WEBVIEW]: "WebviewPage",
  [PageType.IMAGE]: "ErrorPage",
  [PageType.UNKNOWN]: "ErrorPage",
};

export function useURLNavigation<NavType extends FlexibleNavigationProp>(
  overrideNav?: NavType,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks -- We want to be able to use this in places that can't access the context
  const navigation = overrideNav ?? useNavigation();
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
      navigation[func](navName, { url });
    }
    clearFuture();
  };

  return {
    ...navigation,
    pushURL: (url: string) => doNavigationAction(url, "push"),
    replaceURL: (url: string) => doNavigationAction(url, "replace"),
  };
}
