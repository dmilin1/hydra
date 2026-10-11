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
import { PageTypeToNavName } from "./PageTypeToNavName";

export function useRoute<
  Pages extends keyof StackParamsList = keyof StackParamsList,
>() {
  return useRouteUntyped<RouteProp<StackParamsList, Pages>>();
}

type NavFunctionsWithURL = "push" | "replace";

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
      displayMedia({
        media: [[{ source: url, type: "image" }]],
      });
    } else {
      navigation[func](navName as URLRoutes, { url });
    }
    clearFuture();
  };

  const openGallery = (url: string) => {
    /**
     * Base user pages have both posts and comments, so we need to
     * reroute these urls to the /submitted page for gallery mode
     */
    const urlObject = new RedditURL(url);
    const basePath = urlObject.getBasePath();
    const pageType = urlObject.getPageType();
    const userSubPage = basePath.split("/").at(5);
    const userName = basePath.split("/").at(4);
    if (pageType === PageType.USER && !userSubPage) {
      navigation.push("GalleryPage", {
        url: `https://www.reddit.com/user/${userName}/submitted`,
      });
    } else {
      navigation.push("GalleryPage", { url });
    }
  };

  return {
    ...navigation,
    pushURL: (url: string) => doNavigationAction(url, "push"),
    replaceURL: (url: string) => doNavigationAction(url, "replace"),
    openGallery,
  };
}
