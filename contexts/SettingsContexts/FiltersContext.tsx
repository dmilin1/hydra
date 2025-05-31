import { createContext, useContext, useMemo } from "react";
import { Alert } from "react-native";
import {
  useMMKVBoolean,
  useMMKVObject,
  useMMKVString,
} from "react-native-mmkv";

import { filterPosts } from "../../api/AI";
import { Comment } from "../../api/PostDetail";
import { Post } from "../../api/Posts";
import {
  makeTextFilterMap,
  doesPostPassTextFilterMap,
  doesCommentPassTextFilterMap,
} from "../../utils/filters/TextFiltering";
import { FilterFunction } from "../../utils/useRedditDataState";
import { SubscriptionsContext } from "../SubscriptionsContext";
import RedditURL from "../../utils/RedditURL";

type HideSeenURLs = Record<string, boolean>;

export const FILTER_SEEN_POSTS_KEY = "filterSeenPosts";
export const FILTER_SEEN_POSTS_DEFAULT = false;

export const HIDE_SEEN_URLS_KEY = "hideSeenURLs";
export const HIDE_SEEN_URLS_DEFAULT = {} as HideSeenURLs;

const initialValues = {
  filterSeenPosts: FILTER_SEEN_POSTS_DEFAULT,
  hideSeenURLs: HIDE_SEEN_URLS_DEFAULT,
  autoMarkAsSeen: false,
  filterText: "",
  aiFilterText: "",
  filterPostsByAI: ((posts) => posts) as FilterFunction<Post>,
};

const initialPostSettingsContext = {
  ...initialValues,
  toggleFilterSeenPosts: (_newValue?: boolean) => {},
  hideSeenURLs: HIDE_SEEN_URLS_DEFAULT,
  getHideSeenURLStatus: (_url: string) => false as boolean,
  toggleHideSeenURL: (_url: string) => {},
  toggleAutoMarkAsSeen: (_newValue?: boolean) => {},
  setFilterText: (_newValue?: string) => {},
  filterPostsByText: ((posts) => posts) as FilterFunction<Post>,
  doesCommentPassTextFilter: (_comment: Comment) => true,
  setAiFilterText: (_newValue?: string) => {},
  filterPostsByAI: ((posts) => posts) as FilterFunction<Post>,
};

export const FiltersContext = createContext(initialPostSettingsContext);

export function FiltersProvider({ children }: React.PropsWithChildren) {
  const { customerId, isPro } = useContext(SubscriptionsContext);

  const [storedFilterSeenPosts, setFilterSeenPosts] = useMMKVBoolean(
    FILTER_SEEN_POSTS_KEY,
  );
  const filterSeenPosts =
    storedFilterSeenPosts ?? initialValues.filterSeenPosts;

  const [storedHideSeenURLs, setHideSeenURLs] =
    useMMKVObject<HideSeenURLs>(HIDE_SEEN_URLS_KEY);
  const hideSeenURLs = storedHideSeenURLs ?? HIDE_SEEN_URLS_DEFAULT;

  const [storedAutoMarkAsSeen, setAutoMarkAsSeen] =
    useMMKVBoolean("autoMarkAsSeen");
  const autoMarkAsSeen = storedAutoMarkAsSeen ?? initialValues.autoMarkAsSeen;

  const [storedFilterText, setFilterText] = useMMKVString("filterText");
  const filterText = storedFilterText ?? initialValues.filterText;

  const [storedAiFilterText, setAiFilterText] = useMMKVString("aiFilterText");
  const aiFilterText = storedAiFilterText ?? initialValues.aiFilterText;

  const textFilterMap = useMemo(
    () => makeTextFilterMap(filterText),
    [filterText],
  );

  const filterPostsByText: FilterFunction<Post> = (posts) =>
    posts.filter((post) => doesPostPassTextFilterMap(textFilterMap, post));

  const doesCommentPassTextFilter = (comment: Comment) =>
    doesCommentPassTextFilterMap(textFilterMap, comment);

  const filterPostsByAI: FilterFunction<Post> = async (posts) => {
    if (!customerId || !aiFilterText || !isPro) {
      return posts;
    }
    try {
      const aiFilter = await filterPosts(customerId, aiFilterText, posts);
      return posts.filter((post) => !aiFilter[post.id]);
    } catch (error) {
      console.error(error);
      return posts;
    }
  };

  return (
    <FiltersContext.Provider
      value={{
        filterSeenPosts,
        toggleFilterSeenPosts: (newValue = !filterSeenPosts) =>
          setFilterSeenPosts(newValue),

        hideSeenURLs,
        getHideSeenURLStatus: (url: string) => {
          const baseURL = new RedditURL(url).getBasePath();
          return hideSeenURLs[baseURL] ?? filterSeenPosts;
        },
        toggleHideSeenURL: (url: string) => {
          const baseURL = new RedditURL(url).getBasePath();
          const newSetting = !hideSeenURLs[baseURL];
          if (newSetting === filterSeenPosts) {
            delete hideSeenURLs[baseURL];
          } else {
            hideSeenURLs[baseURL] = newSetting;
          }
          setHideSeenURLs(hideSeenURLs);
        },

        autoMarkAsSeen,
        toggleAutoMarkAsSeen: (newValue = !autoMarkAsSeen) => {
          Alert.alert(
            "Restart the app for this change to take effect.",
            newValue && filterSeenPosts
              ? "You may notice slower loads with this setting enabled because all the hidden posts still have to be loaded in the background."
              : undefined,
          );
          setAutoMarkAsSeen(newValue);
        },

        filterText,
        setFilterText: (newValue = "") => setFilterText(newValue),

        aiFilterText,
        setAiFilterText: (newValue = "") => setAiFilterText(newValue),

        filterPostsByText,
        doesCommentPassTextFilter,

        filterPostsByAI,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
