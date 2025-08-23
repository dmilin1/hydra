import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import {
  getPosts,
  Post,
  PrivateSubredditError,
  BannedSubredditError,
} from "../api/Posts";

import { StackPageProps } from "../app/stack";
import PostComponent from "../components/RedditDataRepresentations/Post/PostComponent";
import RedditDataScroller from "../components/UI/RedditDataScroller";
import SearchBar from "../components/UI/SearchBar";
import { FiltersContext } from "../contexts/SettingsContexts/FiltersContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { markPostSeen } from "../db/functions/SeenPosts";
import { filterSeenItems } from "../utils/filters/filterSeenItems";
import useRedditDataState from "../utils/useRedditDataState";
import RedditURL, { PageType } from "../utils/RedditURL";
import { incrementSubredditVisitCount } from "../db/functions/Stats";
import { useURLNavigation } from "../utils/navigation";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../components/Navbar/SortAndContext";
import { SubredditContext } from "../contexts/SubredditContext";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { url } = route.params;
  const navigation = useURLNavigation<
    "PostsPage" | "Home" | "MultiredditPage"
  >();

  const subreddit = new RedditURL(url).getSubreddit();
  const [sort, sortTime] = new RedditURL(url).getSort();
  const searchText = new RedditURL(url).getQueryParam("q");

  const { theme } = useContext(ThemeContext);
  const { subreddits } = useContext(SubredditContext);

  const {
    filterPostsByText,
    filterPostsByAI,
    filterPostsBySubreddit,
    autoMarkAsSeen,
    getHideSeenURLStatus,
  } = useContext(FiltersContext);

  const [rerenderCount, rerender] = useState(0);
  const [accessFailure, setAccessFailure] = useState<
    "private" | "banned" | null
  >(null);

  const shouldFilterSeen = getHideSeenURLStatus(url);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    refreshData: refreshPosts,
    modifyData: modifyPosts,
    deleteData: deletePosts,
    fullyLoaded,
    hitFilterLimit,
  } = useRedditDataState<Post>({
    loadData: async (after, limit) => {
      try {
        return await getPosts(url, {
          after,
          limit,
        });
      } catch (e) {
        if (e instanceof BannedSubredditError) {
          setAccessFailure("banned");
          return [];
        } else if (e instanceof PrivateSubredditError) {
          setAccessFailure("private");
          return [];
        } else {
          throw e;
        }
      }
    },
    filterRules: [
      ...(shouldFilterSeen ? [filterSeenItems] : []),
      filterPostsByText,
      filterPostsByAI,
      filterPostsBySubreddit,
    ],
    limitRampUp: [10, 20, 40, 70, 100],
    refreshDependencies: [searchText, sort, sortTime],
  });

  const handleScrolledPastPost = (post: Post) => {
    if (autoMarkAsSeen) {
      markPostSeen(post);
      rerender((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (subreddit && subreddit !== "all" && subreddit !== "popular") {
      incrementSubredditVisitCount(subreddit);
    }
  }, []);

  useEffect(() => {
    const pageType = new RedditURL(url).getPageType();
    let contextOptions: ContextTypes[];
    let sortOptions: SortTypes[];
    if (pageType === PageType.HOME) {
      contextOptions = [
        shouldFilterSeen ? "Show Seen Posts" : "Hide Seen Posts",
        "Share",
      ];
      sortOptions = ["Best", "Hot", "New", "Top", "Rising"];
    } else if (pageType === PageType.SUBREDDIT) {
      contextOptions = [
        "New Post",
        subreddits.subscriber.find((sub) => sub.name === subreddit)
          ? "Unsubscribe"
          : "Subscribe",
        subreddits.favorites.find((sub) => sub.name === subreddit)
          ? "Unfavorite"
          : "Favorite",
        "Add to Multireddit",
        shouldFilterSeen ? "Show Seen Posts" : "Hide Seen Posts",
        "Sidebar",
        "Wiki",
        "Share",
      ];
      sortOptions = ["Best", "Hot", "New", "Top", "Rising"];
    } else if (pageType === PageType.MULTIREDDIT) {
      contextOptions = ["Share"];
      sortOptions = ["Hot", "New", "Top", "Rising", "Controversial"];
    }
    navigation.setOptions({
      headerRight: () => (
        <SortAndContext
          route={route}
          navigation={navigation}
          sortOptions={sortOptions}
          contextOptions={contextOptions}
        />
      ),
    });
  }, [subreddits, shouldFilterSeen, sort, sortTime]);

  return (
    <View
      style={[
        styles.postsContainer,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {accessFailure === "private" ? (
        <Text
          style={[
            styles.accessFailureText,
            {
              color: theme.subtleText,
            },
          ]}
        >
          🔑 r/{subreddit} has been set to private by its subreddit moderators
        </Text>
      ) : accessFailure === "banned" ? (
        <Text
          style={[
            styles.accessFailureText,
            {
              color: theme.subtleText,
            },
          ]}
        >
          🚫 r/{subreddit} has been banned by Reddit Administrators for breaking
          Reddit rules
        </Text>
      ) : (
        <RedditDataScroller<Post>
          ListHeaderComponent={
            route.name === "PostsPage" ? (
              <SearchBar
                clearOnSearch={true}
                searchOnBlur={false}
                onSearch={(text) => {
                  if (!text) return;
                  const newURL = new RedditURL(
                    `https://www.reddit.com/r/${subreddit}/search/`,
                  );
                  newURL.changeQueryParam("q", text);
                  newURL.changeQueryParam("restrict_sr", "true");
                  navigation.pushURL(newURL.toString());
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
              deletePost={() => {
                deletePosts([item]);
              }}
            />
          )}
          onViewableItemsChanged={(data) => {
            const maxVisibleItem =
              data.viewableItems[data.viewableItems.length - 1]?.index ?? -1;
            const changedItems = data.changed;
            changedItems
              .filter(
                (item) =>
                  !item.isViewable && (item?.index ?? 0) < maxVisibleItem,
              )
              .forEach((viewToken) => {
                const post = viewToken.item as Post;
                handleScrolledPastPost(post);
              });
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  accessFailureText: {
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: 320,
    marginBottom: 150,
  },
});
