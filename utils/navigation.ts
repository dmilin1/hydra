import {
  RouteProp,
  useNavigation as useNavigationUntyped,
  useRoute as useRouteUntyped,
} from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useContext } from "react";

import RedditURL, { PageType } from "./RedditURL";
import { StackParamsList } from "../app/stack";
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

export function useURLNavigation() {
  const navigation = useNavigation();
  const { clearFuture } = useContext(StackFutureContext);

  const doNavigationAction = (url: string, func: NavFunctionsWithURL) => {
    const pageType = new RedditURL(url).getPageType();
    if (pageType === PageType.HOME) {
      navigation[func]("Home", { url });
    } else if (pageType === PageType.SUBREDDIT) {
      navigation.push("PostsPage", { url });
    } else if (pageType === PageType.POST_DETAILS) {
      navigation.push("PostDetailsPage", { url });
    } else if (pageType === PageType.USER) {
      navigation.push("UserPage", { url });
    } else if (pageType === PageType.ACCOUNTS) {
      navigation.push("Accounts", { url });
    } else if (pageType === PageType.SETTINGS) {
      navigation.push("SettingsPage", { url });
    }
    clearFuture();
  };

  return {
    ...navigation,
    pushURL: (url: string) => doNavigationAction(url, "push"),
    replaceURL: (url: string) => doNavigationAction(url, "replace"),
  };
}
