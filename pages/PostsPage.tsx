import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getPosts, Post } from "../api/Posts";

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
import AccessFailureComponent from "../components/UI/AccessFailureComponent";
import useOfferGalleryMode from "../utils/useOfferGalleryMode";
import PostDetails from "./PostDetails";
import SplitViewOptions from "../components/UI/SplitViewOptions";
import { useSplitViewSupport } from "../utils/useSplitViewSupport";

export default function PostsPage({
  route,
}: StackPageProps<"PostsPage" | "Home" | "MultiredditPage">) {
  const { url } = route.params;
  const navigation = useURLNavigation<
    "PostsPage" | "Home" | "MultiredditPage"
  >();

  const redditURL = new RedditURL(url);

  const subreddit = redditURL.getSubreddit();
  const [sort, sortTime] = redditURL.getSort();
  const searchText = redditURL.getQueryParam("q");

  const isCombinedSubredditFeed = redditURL.isCombinedSubredditFeed();

  const { theme } = useContext(ThemeContext);
  const { subreddits } = useContext(SubredditContext);

  const {
    filterPostsByText,
    filterPostsByAI,
    filterPostsBySubreddit,
    autoMarkAsSeen,
    getHideSeenURLStatus,
  } = useContext(FiltersContext);

  const { splitViewEnabled, windowSupportsSplitView } = useSplitViewSupport();

  const showSplitView = splitViewEnabled && windowSupportsSplitView;

  const [rerenderCount, rerender] = useState(0);
  const [postDetailsURL, setPostDetailsURL] = useState<string | null>(null);

  const shouldFilterSeen = getHideSeenURLStatus(url);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    refreshData: refreshPosts,
    modifyData: modifyPosts,
    deleteData: deletePosts,
    fullyLoaded,
    hitFilterLimit,
    accessFailure,
  } = useRedditDataState<Post>({
    loadData: async (after, limit) => await getPosts(url, { after, limit }),
    filterRules: [
      ...(shouldFilterSeen ? [filterSeenItems] : []),
      filterPostsByText,
      filterPostsByAI,
      ...(isCombinedSubredditFeed ? [filterPostsBySubreddit] : []),
    ],
    limitRampUp: [10, 20, 40, 70, 100],
    refreshDependencies: [searchText, sort, sortTime],
  });

  useOfferGalleryMode({ url, posts });

  const handleScrolledPastPost = (post: Post) => {
    if (autoMarkAsSeen) {
      markPostSeen(post);
      rerender((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (subreddit && !isCombinedSubredditFeed) {
      incrementSubredditVisitCount(subreddit);
    }
  }, []);

  useEffect(() => {
    const pageType = new RedditURL(url).getPageType();
    let contextOptions: ContextTypes[];
    let sortOptions: SortTypes[];
    if (pageType === PageType.HOME) {
      contextOptions = [
        "Open in Gallery Mode",
        shouldFilterSeen ? "Show Seen Posts" : "Hide Seen Posts",
        "Share",
      ];
      sortOptions = ["Best", "Hot", "New", "Top", "Rising"];
    } else if (pageType === PageType.SUBREDDIT) {
      contextOptions = [
        "Open in Gallery Mode",
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
      contextOptions = ["Open in Gallery Mode", "Share"];
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
      <AccessFailureComponent
        accessFailure={accessFailure}
        subreddit={subreddit}
      >
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
              onPostOpen={
                showSplitView
                  ? (url) => {
                      setPostDetailsURL(url);
                    }
                  : undefined
              }
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
        {postDetailsURL && showSplitView && (
          <>
            <View
              style={{
                marginLeft: 5,
                backgroundColor: theme.divider,
                width: 1,
              }}
            />
            <View
              style={{
                flex: 1.5,
                position: "relative",
              }}
            >
              <PostDetails
                splitViewURL={postDetailsURL}
                setSplitViewURL={setPostDetailsURL}
              />
              <SplitViewOptions
                splitViewURL={postDetailsURL}
                setSplitViewURL={setPostDetailsURL}
              />
            </View>
          </>
        )}
      </AccessFailureComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  accessFailureText: {
    fontSize: 16,
    textAlign: "center",
    alignSelf: "center",
    maxWidth: 320,
    marginBottom: 150,
  },
});
