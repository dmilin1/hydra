import { createContext, useContext, useMemo } from "react";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

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

export const FILTER_SEEN_POSTS_KEY = "filterSeenPosts";
export const FILTER_SEEN_POSTS_DEFAULT = false;

const initialValues = {
  filterSeenPosts: FILTER_SEEN_POSTS_DEFAULT,
  filterText: "",
  aiFilterText: "",
  filterPostsByAI: ((posts) => posts) as FilterFunction<Post>,
};

const initialPostSettingsContext = {
  ...initialValues,
  toggleFilterSeenPosts: (_newValue?: boolean) => {},
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
        filterSeenPosts: filterSeenPosts ?? initialValues.filterSeenPosts,
        toggleFilterSeenPosts: (newValue = !filterSeenPosts) =>
          setFilterSeenPosts(newValue),

        filterText: storedFilterText ?? initialValues.filterText,
        setFilterText: (newValue = "") => setFilterText(newValue),

        aiFilterText: storedAiFilterText ?? initialValues.aiFilterText,
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
