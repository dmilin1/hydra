import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Post } from "../api/Posts";
import { getPosts } from "../api/gql/Posts";
import { getUserContent } from "../api/gql/User";

import { StackPageProps } from "../app/stack";
import { FiltersContext } from "../contexts/SettingsContexts/FiltersContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { filterSeenItems } from "../utils/filters/filterSeenItems";
import useRedditDataState from "../utils/useRedditDataState";
import RedditURL, { PageType } from "../utils/RedditURL";
import { useURLNavigation } from "../utils/navigation";
import SortAndContext, {
  ContextTypes,
  SortTypes,
} from "../components/Navbar/SortAndContext";
import { SubredditContext } from "../contexts/SubredditContext";
import GalleryComponent from "../components/UI/Gallery/GalleryComponent";
import { filterNonMediaItems } from "../utils/filters/filterNonMediaItems";
import AccessFailureComponent from "../components/UI/AccessFailureComponent";

export default function GalleryPage({ route }: StackPageProps<"GalleryPage">) {
  const { url } = route.params;
  const navigation = useURLNavigation<"GalleryPage">();

  const redditURL = new RedditURL(url);

  const subreddit = redditURL.getSubreddit();
  const [sort, sortTime] = redditURL.getSort();

  const isCombinedSubredditFeed = redditURL.isCombinedSubredditFeed();

  const { theme } = useContext(ThemeContext);
  const { subreddits, isSubscribed, isFavorite } = useContext(SubredditContext);

  const { filterPostsByText, filterPostsBySubreddit, getHideSeenURLStatus } =
    useContext(FiltersContext);

  const shouldFilterSeen = getHideSeenURLStatus(url);

  const {
    data: posts,
    loadMoreData: loadMorePosts,
    fullyLoaded,
    hitFilterLimit,
    accessFailure,
  } = useRedditDataState<Post>({
    loadData: async (after) =>
      // User galleries open on /user/<name>/submitted.
      new RedditURL(url).getPageType() === PageType.USER
        ? (await getUserContent(url, { after })).filter(
            (item): item is Post => item.type === "post",
          )
        : await getPosts(url, { after }),
    filterRules: [
      filterNonMediaItems,
      ...(shouldFilterSeen ? [filterSeenItems] : []),
      filterPostsByText,
      ...(isCombinedSubredditFeed ? [filterPostsBySubreddit] : []),
    ],
    // Posts without media are filtered out, so text-heavy feeds need a few
    // pages. Reddit's feed pages are small (6 posts, then 24).
    filterRetries: 4,
    refreshDependencies: [sort, sortTime],
  });

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
        isSubscribed(subreddit) ? "Unsubscribe" : "Subscribe",
        isFavorite(subreddit) ? "Unfavorite" : "Favorite",
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
    } else if (pageType === PageType.USER) {
      contextOptions = ["Share"];
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
        contentName={
          redditURL.getPageType() === PageType.USER
            ? redditURL.getPageName()
            : subreddit
        }
      >
        <GalleryComponent
          posts={posts}
          loadMore={loadMorePosts}
          fullyLoaded={fullyLoaded}
          hitFilterLimit={hitFilterLimit}
        />
      </AccessFailureComponent>
    </View>
  );
}

const styles = StyleSheet.create({
  postsContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
