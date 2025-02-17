import {
  RouteProp,
  useNavigation as useNavigationUntyped,
  useRoute as useRouteUntyped,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContext } from "react";

import RedditURL, { PageType } from "./RedditURL";
import { StackParamsList } from "../app/stack";
import { MediaViewerContext } from "../contexts/MediaViewerContext";
import { StackFutureContext } from "../contexts/StackFutureContext";

export function useNavigation() {
  return useNavigationUntyped<NativeStackNavigationProp<StackParamsList>>();
}

export function useRoute<
  Pages extends keyof StackParamsList = keyof StackParamsList,
>() {
  return useRouteUntyped<RouteProp<StackParamsList, Pages>>();
}

type NavFunctionsWithURL = "push" | "replace";

export function useURLNavigation(
  overrideNav?: NativeStackNavigationProp<StackParamsList>,
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
    if (pageType === PageType.HOME) {
      navigation[func]("Home", { url });
    } else if (pageType === PageType.SUBREDDIT) {
      navigation[func]("PostsPage", { url });
    } else if (pageType === PageType.POST_DETAILS) {
      navigation[func]("PostDetailsPage", { url });
    } else if (pageType === PageType.MULTIREDDIT) {
      navigation[func]("MultiredditPage", { url });
    } else if (pageType === PageType.USER) {
      navigation[func]("UserPage", { url });
    } else if (pageType === PageType.ACCOUNTS) {
      navigation[func]("Accounts", { url });
    } else if (pageType === PageType.MESSAGES) {
      navigation[func]("MessagesPage", { url });
    } else if (pageType === PageType.SETTINGS) {
      navigation[func]("SettingsPage", { url });
    } else if (pageType === PageType.WEBVIEW) {
      navigation[func]("WebviewPage", { url });
    } else if (pageType === PageType.IMAGE) {
      displayMedia(url);
    } else {
      navigation[func]("ErrorPage", { url });
    }
    clearFuture();
  };

  return {
    ...navigation,
    pushURL: (url: string) => doNavigationAction(url, "push"),
    replaceURL: (url: string) => doNavigationAction(url, "replace"),
  };
}
