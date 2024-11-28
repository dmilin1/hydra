import React, { useContext, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

import { getPosts, Post } from "../api/Posts";
import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import Scroller from "../components/UI/Scroller";
import SearchBar from "../components/UI/SearchBar";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { theme } = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);
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
      setPosts([...posts, ...newPosts]);
    }
  };

  return (
    <View
      style={t(styles.postsContainer, {
        backgroundColor: theme.background,
      })}
    >
      <Scroller
        loadMore={loadMorePosts}
        headerComponent={
          route.name === "PostsPage" && (
            <SearchBar
              onSearch={(text) => {
                search.current = text;
                loadMorePosts(true);
              }}
            />
          )
        }
      >
        {posts.map((post, index) => (
          <PostComponent key={`${post.id}-${index}`} initialPostState={post} />
        ))}
      </Scroller>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
