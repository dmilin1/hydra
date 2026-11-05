import Feather from "@react-native-vector-icons/feather";
import {
  StackActions,
  TabActions,
  useFocusEffect,
} from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";
import type { SearchBarCommands } from "react-native-screens";

import { makeSearchURL } from "../api/Search";
import { Subreddit, SubredditListItem } from "../api/Subreddits";
import { getDiscoverSubreddits, getSearchResults } from "../api/gql/Search";
import { StackPageProps, URLRoutes } from "../app/stack";
import SubredditIcon from "../components/RedditDataRepresentations/Post/PostParts/SubredditIcon";
import List from "../components/UI/List";
import { AccountContext } from "../contexts/AccountContext";
import { MediaViewerContext } from "../contexts/MediaViewerContext";
import { ThemeContext } from "../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../contexts/SubredditContext";
import {
  TabBarScrollView,
  TabBarSpacer,
} from "../contexts/TabBarInsetsContext";
import { useDebouncedEffect } from "../utils/debounce";
import KeyStore from "../utils/KeyStore";
import { HAS_SEARCH_TAB_ROLE } from "../utils/liquidGlass";
import { PageTypeToNavName } from "../utils/PageTypeToNavName";
import RedditURL, { PageType } from "../utils/RedditURL";
import { getSearchOrigin } from "../utils/searchOrigin";

const RECENT_SEARCHES_KEY = "recentSearches";
const MAX_RECENT_SEARCHES = 8;
const MAX_YOUR_SUBREDDIT_MATCHES = 5;

/**
 * Search acts like a modal over the tab it was opened from: whatever is picked
 * opens on that tab's stack, and the Search tab never goes deeper than this.
 */
export default function SearchPage({
  navigation,
}: StackPageProps<"SearchPage">) {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(AccountContext);
  const { subreddits: userSubs } = useContext(SubredditContext);
  const { displayMedia } = useContext(MediaViewerContext);

  const searchBarRef = useRef<SearchBarCommands>(null);
  const [query, setQuery] = useState("");
  const [subredditResults, setSubredditResults] = useState<Subreddit[]>([]);
  const [loading, setLoading] = useState(false);
  const [discover, setDiscover] = useState<Subreddit[]>([]);
  const [recentSearchesJSON, setRecentSearchesJSON] =
    useMMKVString(RECENT_SEARCHES_KEY);
  const latestQuery = useRef("");

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();
  const recentSearches: string[] = JSON.parse(recentSearchesJSON ?? "[]");

  const tabs = navigation.getParent();
  // Looked up on use, as the header search bar holds an older closure
  const getOriginStack = () =>
    tabs?.getState().routes.find((route) => route.name === getSearchOrigin())
      ?.state;
  const originStack = getOriginStack();

  const openURL = async (link: string) => {
    const redditURL = (
      await new RedditURL(link).resolveURL()
    ).applyPreferredSorts();
    const pageType = redditURL.getPageType();
    const url = redditURL.url;
    searchBarRef.current?.clearText();
    setQuery("");
    if (pageType === PageType.IMAGE) {
      displayMedia({ media: [[{ source: url, type: "image" }]] });
      return;
    }
    const screen = PageTypeToNavName[pageType] as URLRoutes;
    const targetStack = getOriginStack();
    if (!tabs || !targetStack?.key) {
      navigation.push(screen, { url });
      return;
    }
    tabs.dispatch(TabActions.jumpTo(getSearchOrigin()));
    tabs.dispatch({
      ...StackActions.push(screen, { url }),
      target: targetStack.key,
    });
  };

  const search = (text: string) => {
    const searchText = text.trim();
    if (!searchText) return;
    // Read from storage, as the header search bar holds an older closure
    const previous: string[] = JSON.parse(
      KeyStore.getString(RECENT_SEARCHES_KEY) ?? "[]",
    );
    setRecentSearchesJSON(
      JSON.stringify(
        [searchText, ...previous.filter((s) => s !== searchText)].slice(
          0,
          MAX_RECENT_SEARCHES,
        ),
      ),
    );
    openURL(makeSearchURL(searchText));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        ref: searchBarRef,
        placeholder: "Search Reddit",
        autoCapitalize: "none",
        autoFocus: true,
        hideWhenScrolling: false,
        textColor: theme.text,
        tintColor: theme.iconPrimary,
        hintTextColor: theme.subtleText,
        headerIconColor: theme.text,
        onChangeText: (e) => setQuery(e.nativeEvent.text),
        onSearchButtonPress: (e) => search(e.nativeEvent.text),
      },
    });
  }, [theme]);

  // The system search tab focuses the field itself
  useFocusEffect(
    useCallback(() => {
      if (HAS_SEARCH_TAB_ROLE) return;
      searchBarRef.current?.focus();
    }, []),
  );

  // Recommendations are personal, so reload them for each account.
  useEffect(() => {
    setDiscover([]);
    if (!currentUser) return;
    let cancelled = false;
    getDiscoverSubreddits()
      .then((subreddits) => !cancelled && setDiscover(subreddits))
      // Leave the list empty; it's only suggestions.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useDebouncedEffect(
    300,
    () => {
      latestQuery.current = trimmedQuery;
      if (!trimmedQuery) {
        setLoading(false);
        return;
      }
      setLoading(true);
      getSearchResults<"subreddits">("subreddits", trimmedQuery, { limit: 6 })
        .catch(() => [])
        .then((subreddits) => {
          // Typing on starts another search; only the latest one counts.
          if (latestQuery.current !== trimmedQuery) return;
          setSubredditResults(subreddits);
          setLoading(false);
        });
    },
    [trimmedQuery],
  );

  const yourSubreddits = [
    ...userSubs.favorites,
    ...userSubs.moderator,
    ...userSubs.subscriber,
  ].filter(
    (sub, i, subs) => subs.findIndex((other) => other.name === sub.name) === i,
  );
  const yourSubredditMatches = yourSubreddits
    .filter((sub) => sub.name.toLowerCase().includes(lowerQuery))
    .sort(
      (a, b) =>
        Number(b.name.toLowerCase().startsWith(lowerQuery)) -
        Number(a.name.toLowerCase().startsWith(lowerQuery)),
    )
    .slice(0, MAX_YOUR_SUBREDDIT_MATCHES);
  const otherSubredditMatches = subredditResults.filter(
    (sub) =>
      !yourSubredditMatches.some(
        (yours) => yours.name.toLowerCase() === sub.name.toLowerCase(),
      ),
  );

  const originTopRoute = originStack?.routes[originStack.index ?? 0];
  const originURL = (originTopRoute?.params as { url?: string } | undefined)
    ?.url;
  const originSubreddit =
    originURL && !new RedditURL(originURL).isCombinedSubredditFeed()
      ? new RedditURL(originURL).getSubreddit()
      : null;

  const jumpMatch = trimmedQuery.match(/^\/?(r|u|user)\/([\w-]+)\/?$/i);
  const jumpURL = jumpMatch
    ? `https://www.reddit.com/${jumpMatch[1].toLowerCase() === "r" ? "r" : "user"}/${jumpMatch[2]}`
    : /^https?:\/\//.test(trimmedQuery) &&
        RedditURL.getPageType(trimmedQuery) !== PageType.UNKNOWN
      ? trimmedQuery
      : null;

  const subredditItem = (sub: SubredditListItem) => ({
    key: sub.url,
    icon: (
      <SubredditIcon
        subredditIcon={sub.iconURL}
        overridePostAppearanceSetting={true}
      />
    ),
    text: sub.name,
    onPress: () => openURL(sub.url),
  });

  return (
    <View style={styles.searchContainer}>
      <TabBarScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {trimmedQuery ? (
          <>
            <List
              items={[
                {
                  key: "search",
                  icon: (
                    <Feather
                      name="search"
                      size={22}
                      color={theme.iconPrimary}
                    />
                  ),
                  text: `Search for "${trimmedQuery}"`,
                  onPress: () => search(trimmedQuery),
                },
                {
                  key: "searchOrigin",
                  icon: (
                    <Feather
                      name="search"
                      size={22}
                      color={theme.iconPrimary}
                    />
                  ),
                  text: `Search r/${originSubreddit} for "${trimmedQuery}"`,
                  hide: !originSubreddit,
                  onPress: () => {
                    const url = new RedditURL(
                      `https://www.reddit.com/r/${originSubreddit}/search/`,
                    );
                    url.changeQueryParam("q", trimmedQuery);
                    url.changeQueryParam("restrict_sr", "true");
                    openURL(url.toString());
                  },
                },
                {
                  key: "jump",
                  icon: (
                    <Feather
                      name="arrow-up-right"
                      size={22}
                      color={theme.iconPrimary}
                    />
                  ),
                  text: jumpMatch ? `Go to ${trimmedQuery}` : "Open link",
                  hide: !jumpURL,
                  onPress: () => jumpURL && openURL(jumpURL),
                },
              ]}
            />
            {yourSubredditMatches.length ? (
              <List
                title="Your Subreddits"
                items={yourSubredditMatches.map(subredditItem)}
              />
            ) : null}
            {otherSubredditMatches.length ? (
              <List
                title="Subreddits"
                items={otherSubredditMatches.map(subredditItem)}
              />
            ) : null}
            {loading ? (
              <ActivityIndicator
                style={styles.loader}
                size="small"
                color={theme.text}
              />
            ) : null}
          </>
        ) : (
          <>
            {recentSearches.length ? (
              <List
                title="Recent Searches"
                items={[
                  ...recentSearches.map((recent) => ({
                    key: `recent-${recent}`,
                    icon: (
                      <Feather
                        name="clock"
                        size={22}
                        color={theme.iconPrimary}
                      />
                    ),
                    text: recent,
                    onPress: () => search(recent),
                  })),
                  {
                    key: "clearRecent",
                    icon: (
                      <Feather name="x" size={22} color={theme.subtleText} />
                    ),
                    rightIcon: <View />,
                    text: "Clear Recent Searches",
                    onPress: () => setRecentSearchesJSON(undefined),
                  },
                ]}
              />
            ) : null}
            {userSubs.favorites.length ? (
              <List
                title="Favorites"
                items={userSubs.favorites.map(subredditItem)}
              />
            ) : null}
            {discover.length ? (
              <List
                title="Discover Subreddits"
                items={discover.map((sub) => ({
                  key: sub.id,
                  icon: (
                    <Feather
                      name="compass"
                      size={22}
                      color={theme.iconPrimary}
                    />
                  ),
                  text: sub.name,
                  onPress: () => openURL(sub.url),
                }))}
              />
            ) : null}
          </>
        )}
        <TabBarSpacer />
      </TabBarScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 20,
  },
});
