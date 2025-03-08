import { createContext, useMemo } from "react";
import { useMMKVBoolean, useMMKVString } from "react-native-mmkv";

import { Comment } from "../../api/PostDetail";
import { Post } from "../../api/Posts";
import {
  makeTextFilterMap,
  doesPostPassTextFilterMap,
  doesCommentPassTextFilterMap,
} from "../../utils/filters/TextFiltering";
import { FilterFunction } from "../../utils/useRedditDataState";

export const FILTER_SEEN_POSTS_KEY = "filterSeenPosts";
export const FILTER_SEEN_POSTS_DEFAULT = false;

const initialValues = {
  filterSeenPosts: FILTER_SEEN_POSTS_DEFAULT,
  filterText: "",
};

const initialPostSettingsContext = {
  ...initialValues,
  toggleFilterSeenPosts: (_newValue?: boolean) => {},
  setFilterText: (_newValue?: string) => {},
  filterPostsByText: ((posts) => posts) as FilterFunction<Post>,
  doesCommentPassTextFilter: (_comment: Comment) => true,
};

export const FiltersContext = createContext(initialPostSettingsContext);

export function FiltersProvider({ children }: React.PropsWithChildren) {
  const [storedFilterSeenPosts, setFilterSeenPosts] = useMMKVBoolean(
    FILTER_SEEN_POSTS_KEY,
  );
  const filterSeenPosts =
    storedFilterSeenPosts ?? initialValues.filterSeenPosts;

  const [storedFilterText, setFilterText] = useMMKVString("filterText");
  const filterText = storedFilterText ?? initialValues.filterText;

  const textFilterMap = useMemo(
    () => makeTextFilterMap(filterText),
    [filterText],
  );

  const filterPostsByText: FilterFunction<Post> = (posts) =>
    posts.filter((post) => doesPostPassTextFilterMap(textFilterMap, post));

  const doesCommentPassTextFilter = (comment: Comment) =>
    doesCommentPassTextFilterMap(textFilterMap, comment);

  return (
    <FiltersContext.Provider
      value={{
        filterSeenPosts: filterSeenPosts ?? initialValues.filterSeenPosts,
        toggleFilterSeenPosts: (newValue = !filterSeenPosts) =>
          setFilterSeenPosts(newValue),

        filterText: storedFilterText ?? initialValues.filterText,
        setFilterText: (newValue = "") => setFilterText(newValue),

        filterPostsByText,
        doesCommentPassTextFilter,
      }}
    >
      {children}
    </FiltersContext.Provider>
  );
}
