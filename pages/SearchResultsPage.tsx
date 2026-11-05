import React, { useContext, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Touchable } from "react-native-gesture-handler";

import {
  getSearchType,
  makeSearchURL,
  SearchResult,
  SearchTypes,
} from "../api/Search";
import { getSearchResults } from "../api/gql/Search";
import { StackPageProps } from "../app/stack";
import SortAndContext from "../components/Navbar/SortAndContext";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import SubredditComponent from "../components/RedditDataRepresentations/Subreddit/SubredditComponent";
import UserComponent from "../components/RedditDataRepresentations/User/UserComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { useURLNavigation } from "../utils/navigation";
import RedditURL from "../utils/RedditURL";
import useRedditDataState from "../utils/useRedditDataState";

export default function SearchResultsPage({
  route,
}: StackPageProps<"SearchResultsPage">) {
  const { url } = route.params;
  const navigation = useURLNavigation<"SearchResultsPage">();
  const { theme } = useContext(ThemeContext);

  const redditURL = new RedditURL(url);
  const query = redditURL.getQueryParam("q") ?? "";
  const searchType = getSearchType(redditURL.getQueryParam("type"));
  const [sort, sortTime] = redditURL.getSort();

  const {
    data: searchResults,
    loadMoreData: loadMoreSearchResults,
    refreshData: refreshSearchResults,
    modifyData: modifySearchResults,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState<SearchResult>({
    loadData: async (after) =>
      await getSearchResults(searchType, query, {
        after,
        sort: sort ?? undefined,
        time: sortTime ?? undefined,
      }),
    refreshDependencies: [query, searchType, sort, sortTime],
  });

  useEffect(() => {
    navigation.setOptions({
      title: query || "Search",
      headerRight: () => (
        <SortAndContext
          route={route}
          navigation={navigation}
          sortOptions={
            searchType === "posts"
              ? ["Relevance", "Hot", "New", "Top", "Comment Count"]
              : undefined
          }
          contextOptions={["Share"]}
        />
      ),
    });
  }, [query, searchType, sort, sortTime]);

  return (
    <View style={styles.resultsContainer}>
      <RedditDataScroller<SearchResult>
        ListHeaderComponent={
          <>
            <SearchBar
              initialSearch={query}
              onSearch={(text) => {
                const newURL = new RedditURL(url);
                newURL.changeQueryParam("q", text);
                navigation.setParams({ url: newURL.toString() });
              }}
            />
            <View style={styles.searchTypesContainer}>
              {SearchTypes.map((type) => (
                <Touchable
                  key={type}
                  style={[
                    styles.searchType,
                    {
                      backgroundColor:
                        searchType === type ? theme.tint : "transparent",
                    },
                  ]}
                  activeOpacity={0.8}
                  animationDuration={{ in: 0, out: 150 }}
                  onPress={() =>
                    navigation.setParams({ url: makeSearchURL(query, type) })
                  }
                >
                  <Text style={{ color: theme.text }}>
                    {type.toUpperCase()}
                  </Text>
                </Touchable>
              ))}
            </View>
          </>
        }
        loadMore={loadMoreSearchResults}
        refresh={refreshSearchResults}
        fullyLoaded={fullyLoaded}
        hitFilterLimit={hitFilterLimit}
        data={searchResults}
        renderItem={({ item }) => {
          if (item.type === "post")
            return (
              <PostComponent
                post={item}
                setPost={(newPost) => modifySearchResults([newPost])}
              />
            );
          if (item.type === "subreddit")
            return <SubredditComponent subreddit={item} />;
          if (item.type === "user") return <UserComponent user={item} />;
          return null;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  searchTypesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 5,
  },
  searchType: {
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
});
