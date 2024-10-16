import React, { useContext, useState } from "react";
import { StyleSheet, View } from "react-native";

import { getPosts, Post } from "../api/Posts";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import Scroller from "../components/UI/Scroller";
import SearchBar from "../components/UI/SearchBar";
import { ThemeContext, t } from "../contexts/SettingsContexts/ThemeContext";
import RedditURL, { PageType } from "../utils/RedditURL";

type PostsPageProps = {
  url: string;
};

export default function PostsPage({ url }: PostsPageProps) {
  const { theme } = useContext(ThemeContext);

  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState<string>("");

  const isSubredditPage =
    new RedditURL(url).getPageType() === PageType.SUBREDDIT;

  const loadMorePosts = async (refresh = false) => {
    const newPosts = await getPosts(url, {
      after: refresh ? undefined : posts.slice(-1)[0]?.after,
      search,
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
        maintainVisibleContentPosition={!!posts.length}
        headerComponent={
          isSubredditPage && (
            <SearchBar
              onSearch={() => loadMorePosts(true)}
              onChangeText={setSearch}
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
