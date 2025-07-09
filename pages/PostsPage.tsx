import React, { useContext, useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { getPosts, Post, fetchPostsAccessStatus } from "../api/Posts";

import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { FiltersContext } from "../contexts/SettingsContexts/FiltersContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { markPostSeen } from "../db/functions/SeenPosts";
import { filterSeenItems } from "../utils/filters/filterSeenItems";
import useRedditDataState from "../utils/useRedditDataState";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { url } = route.params;

  const { theme } = useContext(ThemeContext);
  const {
    filterPostsByText,
    filterPostsByAI,
    autoMarkAsSeen,
    getHideSeenURLStatus,
  } = useContext(FiltersContext);

  const [rerenderCount, rerender] = useState(0);

  const shouldFilterSeen = getHideSeenURLStatus(url);

  const [postsAccessStatus, setpostsAccessStatus] = useState<{
    reason: string | null;
    success: boolean;
    name: string | null;
  } | null>(null);

  useEffect(() => {
    fetchPostsAccessStatus(url).then(setpostsAccessStatus);
  }, [url]);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    refreshData: refreshPosts,
    modifyData: modifyPosts,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState<Post>({
    loadData: async (after, limit) =>
      await getPosts(url, {
        after,
        search: search.current,
        limit,
      }),
    filterRules: [
      ...(shouldFilterSeen ? [filterSeenItems] : []),
      filterPostsByText,
      filterPostsByAI,
    ],
    limitRampUp: [10, 20, 40, 70, 100],
  });

  const search = useRef<string>("");

  const handleScrolledPastPost = (post: Post) => {
    if (autoMarkAsSeen) {
      markPostSeen(post);
      rerender((prev) => prev + 1);
    }
  };


  if (postsAccessStatus && !postsAccessStatus.success) {
    const text = (postsAccessStatus.reason === "private")
      ? (`🔑 r/${postsAccessStatus.name} has been set to private by its subreddit moderators`)
      : (`🚫 r/${postsAccessStatus.name} has been banned by Reddit Administrators for breaking Reddit rules`);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: theme.text,
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.postsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
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
        extraData={rerenderCount} // This triggers a rerender of the visible list items
        renderItem={({ item }) => (
          <PostComponent
            post={item}
            setPost={(newPost) => {
              modifyPosts([newPost]);
            }}
          />
        )}
        onViewableItemsChanged={(data) => {
          const maxVisibleItem =
            data.viewableItems[data.viewableItems.length - 1]?.index ?? -1;
          const changedItems = data.changed;
          changedItems
            .filter(
              (item) => !item.isViewable && (item?.index ?? 0) < maxVisibleItem,
            )
            .forEach((viewToken) => {
              const post = viewToken.item as Post;
              handleScrolledPastPost(post);
            });
        }}
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
