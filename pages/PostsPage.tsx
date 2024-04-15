import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";

import { getPosts, Post } from "../api/Posts";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import Scroller from "../components/UI/Scroller";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";

type PostsPageProps = {
  url: string;
};

export default function PostsPage({ url }: PostsPageProps) {
  const { theme } = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);

  const loadMorePosts = async (refresh = false) => {
    const newPosts = await getPosts(url, {
      after: refresh ? undefined : posts.slice(-1)[0]?.after,
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
      <Scroller loadMore={loadMorePosts}>
        {posts.map((post, index) => (
          <PostComponent key={index} initialPostState={post} />
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
