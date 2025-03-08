import React, { useContext, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { getPosts, Post } from "../api/Posts";
import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { FiltersContext } from "../contexts/SettingsContexts/FiltersContext";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import { filterSeenItems } from "../utils/filters/filterSeenItems";
import useRedditDataState from "../utils/useRedditDataState";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { theme } = useContext(ThemeContext);
  const { filterPostsByText } = useContext(FiltersContext);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    refreshData: refreshPosts,
    modifyData: modifyPosts,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState<Post>({
    loadData: async (after) =>
      await getPosts(url, {
        after,
        search: search.current,
      }),
    filterRules: [filterSeenItems, filterPostsByText],
  });

  const search = useRef<string>("");

  const { url } = route.params;

  return (
    <View
      style={t(styles.postsContainer, {
        backgroundColor: theme.background,
      })}
    >
      <RedditDataScroller<Post>
        ListHeaderComponent={
          route.name === "PostsPage" ? (
            <SearchBar
              onSearch={(text) => {
                search.current = text;
                refreshPosts();
              }}
            />
          ) : null
        }
        loadMore={loadMorePosts}
        refresh={refreshPosts}
        fullyLoaded={fullyLoaded}
        hitFilterLimit={hitFilterLimit}
        data={posts}
        renderItem={({ item }) => (
          <PostComponent
            post={item}
            setPost={(newPost) => {
              modifyPosts([newPost]);
            }}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
