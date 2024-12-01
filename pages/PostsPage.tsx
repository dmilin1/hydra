import React, { useContext, useRef } from "react";
import { StyleSheet, View } from "react-native";

import { getPosts, Post } from "../api/Posts";
import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import useRedditDataState from "../utils/useRedditDataState";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { theme } = useContext(ThemeContext);

  const {
    data: posts,
    setData: setPosts,
    addData: addPosts,
    fullyLoaded,
  } = useRedditDataState<Post>();

  const search = useRef<string>("");

  const { url } = route.params;

  const loadMorePosts = async (refresh = false) => {
    const newPosts = await getPosts(url, {
      after: refresh ? undefined : posts.slice(-1)[0]?.after,
      search: search.current,
    });
    if (refresh) {
      setPosts(newPosts);
    } else {
      addPosts(newPosts);
    }
  };

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
                loadMorePosts(true);
              }}
            />
          ) : null
        }
        loadMore={loadMorePosts}
        fullyLoaded={fullyLoaded}
        data={posts}
        renderItem={({ item }) => (
          <PostComponent
            post={item}
            setPost={(newPost) => {
              setPosts(
                posts.map((post) => (post.id === newPost.id ? newPost : post)),
              );
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
