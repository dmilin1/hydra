import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Post } from "../api/Posts";
import { searchSubredditPosts } from "../api/gql/Search";

import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import useRedditDataState from "../utils/useRedditDataState";
import RedditURL from "../utils/RedditURL";
import { useURLNavigation } from "../utils/navigation";
import SortAndContext from "../components/Navbar/SortAndContext";

export default function SubredditSearchPage({
  route,
}: StackPageProps<"SubredditSearchPage">) {
  const { url } = route.params;
  const navigation = useURLNavigation<"SubredditSearchPage">();

  const [sort, sortTime] = new RedditURL(url).getSort();
  const searchText = new RedditURL(url).getQueryParam("q");

  const { theme } = useContext(ThemeContext);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    refreshData: refreshPosts,
    updateData,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState<Post>({
    loadData: async (after) => await searchSubredditPosts(url, { after }),
    refreshDependencies: [searchText, sort, sortTime],
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <SortAndContext
          route={route}
          navigation={navigation}
          sortOptions={["Relevance", "Hot", "New", "Top", "Comment Count"]}
          contextOptions={["Share"]}
        />
      ),
    });
  }, [searchText, sort, sortTime]);

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
          <SearchBar
            initialSearch={searchText ?? undefined}
            onSearch={(text) => {
              const newURL = new RedditURL(url);
              newURL.changeQueryParam("q", text);
              navigation.setParams({
                url: newURL.toString(),
              });
            }}
          />
        }
        loadMore={loadMorePosts}
        refresh={refreshPosts}
        fullyLoaded={fullyLoaded}
        hitFilterLimit={hitFilterLimit}
        data={posts}
        renderItem={({ item }) => (
          <PostComponent
            post={item}
            updatePost={(update) => updateData(item, update)}
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
