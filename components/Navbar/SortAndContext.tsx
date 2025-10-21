import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
  Entypo,
  FontAwesome,
} from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import React, { useContext } from "react";
import { Share, StyleSheet, View, TouchableOpacity, Alert } from "react-native";

import { deleteUserContent, PostDetail } from "../../api/PostDetail";
import { blockUser, User } from "../../api/User";
import { StackParamsList, URLRoutes } from "../../app/stack";
import {
  makeCommentSubredditSortKey,
  makePostSubredditSortKey,
  makePostSubredditSortTopKey,
  REMEMBER_COMMENT_SUBREDDIT_SORT_KEY,
  REMEMBER_POST_SUBREDDIT_SORT_KEY,
} from "../../constants/SettingsKeys";
import { ModalContext } from "../../contexts/ModalContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../contexts/SubredditContext";
import KeyStore from "../../utils/KeyStore";
import RedditURL, { PageType } from "../../utils/RedditURL";
import { useURLNavigation } from "../../utils/navigation";
import { FlexibleNavigationProp } from "../../utils/navigationTypes";
import useContextMenu from "../../utils/useContextMenu";
import EditPost from "../Modals/EditPost";
import NewMessage from "../Modals/NewMessage";
import NewPost from "../Modals/NewPost";
import SelectText from "../Modals/SelectText";
import { FiltersContext } from "../../contexts/SettingsContexts/FiltersContext";

export type SortTypes =
  | "Best"
  | "Hot"
  | "New"
  | "Top"
  | "Rising"
  | "Controversial"
  | "Old"
  | "Q&A"
  | "Relevance"
  | "Comment Count";

export type ContextTypes =
  | "Share"
  | "Select Text"
  | "Subscribe"
  | "Unsubscribe"
  | "Favorite"
  | "Unfavorite"
  | "New Post"
  | "Add to Multireddit"
  | "Edit"
  | "Delete"
  | "Message"
  | "Block"
  | "Report"
  | "Show Seen Posts"
  | "Hide Seen Posts"
  | "Sidebar"
  | "Wiki";

type SortAndContextProps = {
  route: RouteProp<StackParamsList, URLRoutes>;
  navigation: FlexibleNavigationProp;
  sortOptions?: SortTypes[];
  contextOptions?: ContextTypes[];
  pageData?: PostDetail | User;
};

export default function SortAndContext({
  navigation,
  route,
  sortOptions,
  contextOptions,
  pageData,
}: SortAndContextProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);
  const { subscribe, unsubscribe, toggleFavorite, multis, addSubToMulti } =
    useContext(SubredditContext);
  const { toggleHideSeenURL } = useContext(FiltersContext);

  const { replaceURL, pushURL, setParams } = useURLNavigation();

  const showContextMenu = useContextMenu();

  const currentPath = route.params.url;
  const pageType = new RedditURL(currentPath).getPageType();
  const [currentSort, _] = currentPath
    ? new RedditURL(currentPath).getSort()
    : ([null, null] as [string | null, string | null]);

  const changeSort = (sort: string, time?: string) => {
    const redditUrl = new RedditURL(currentPath).changeSort(sort, time);
    const pageType = redditUrl.getPageType();
    const subreddit = redditUrl.getSubreddit();
    setParams({
      url: redditUrl.toString(),
    });
    if (
      pageType === PageType.SUBREDDIT &&
      KeyStore.getBoolean(REMEMBER_POST_SUBREDDIT_SORT_KEY)
    ) {
      KeyStore.set(makePostSubredditSortKey(subreddit), sort.toLowerCase());
      if (sort === "top" && time) {
        KeyStore.set(
          makePostSubredditSortTopKey(subreddit),
          time.toLowerCase(),
        );
      }
    }
    if (
      pageType === PageType.POST_DETAILS &&
      KeyStore.getBoolean(REMEMBER_COMMENT_SUBREDDIT_SORT_KEY)
    ) {
      KeyStore.set(makeCommentSubredditSortKey(subreddit), sort.toLowerCase());
    }
  };

  const handleTopSort = async () => {
    const topSort = await showContextMenu({
      options: ["Hour", "Day", "Week", "Month", "Year", "All"],
    });
    if (topSort) {
      changeSort("top", topSort);
    }
  };

  return (
    <View style={styles.sectionContainer}>
      {sortOptions && (
        <TouchableOpacity
          style={{ width: 44, height: 24 }}
          activeOpacity={0.5}
          accessibilityLabel="Sort options"
          accessibilityRole="button"
          accessibilityHint="Sort the posts by the selected option"
          accessibilityValue={{ text: currentSort ?? "Default" }}
          accessibilityActions={sortOptions.map((sort) => ({
            name: sort,
            label: `Sort the posts by ${sort}`,
          }))}
          onAccessibilityAction={(event) => {
            const sort = event.nativeEvent.actionName;
            if (sort === "Top") {
              handleTopSort();
            } else if (sort) {
              changeSort(sort);
            }
          }}
          onPress={async () => {
            const sort = await showContextMenu({
              options: sortOptions,
            });
            if (
              sort === "Top" &&
              [
                PageType.HOME,
                PageType.SUBREDDIT,
                PageType.MULTIREDDIT,
                PageType.USER,
              ].includes(pageType)
            ) {
              handleTopSort();
            } else if (sort) {
              changeSort(sort);
            }
          }}
        >
          {(currentSort === "best" && (
            <AntDesign
              name="Trophy"
              size={24}
              color={theme.iconOrTextButton}
              style={{ marginRight: 20 }}
            />
          )) ||
            (currentSort === "hot" && (
              <SimpleLineIcons
                name="fire"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "new" && (
              <AntDesign
                name="clockcircleo"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "top" && (
              <MaterialCommunityIcons
                name="podium-gold"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "rising" && (
              <MaterialIcons
                name="trending-up"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "controversial" && (
              <MaterialCommunityIcons
                name="sword-cross"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "old" && (
              <MaterialCommunityIcons
                name="timer-sand-complete"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "qa" && (
              <AntDesign
                name="message1"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "relevance" && (
              <MaterialCommunityIcons
                name="archive-search-outline"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "comments" && (
              <FontAwesome
                name="comment-o"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )) || (
              <AntDesign
                name="Trophy"
                size={24}
                color={theme.iconOrTextButton}
                style={{ marginRight: 20 }}
              />
            )}
        </TouchableOpacity>
      )}
      {contextOptions && (
        <TouchableOpacity
          style={{ width: 24, height: 24 }}
          activeOpacity={0.5}
          onPress={async () => {
            const result = await showContextMenu({
              options: contextOptions,
            });
            if (result === "Share") {
              Share.share({ url: new RedditURL(currentPath).toString() });
            } else if (
              result === "Select Text" &&
              pageData?.type === "postDetail"
            ) {
              setModal(<SelectText text={pageData.text} />);
            } else if (result === "New Post") {
              setModal(
                <NewPost
                  subreddit={new RedditURL(currentPath).getSubreddit()}
                  contentSent={(newPostURL) => pushURL(newPostURL)}
                />,
              );
            } else if (result === "Subscribe") {
              subscribe(new RedditURL(currentPath).getSubreddit());
            } else if (result === "Unsubscribe") {
              unsubscribe(new RedditURL(currentPath).getSubreddit());
            } else if (result === "Favorite" || result === "Unfavorite") {
              toggleFavorite(new RedditURL(currentPath).getSubreddit());
            } else if (result === "Add to Multireddit") {
              if (multis.length === 0) {
                alert(
                  "You have no multireddits created yet. Please create one first.",
                );
              }
              const multi = await showContextMenu({
                options: multis.map((multi) => multi.name),
              });
              const selectedMulti = multis.find((m) => m.name === multi);
              if (selectedMulti) {
                addSubToMulti(
                  selectedMulti,
                  new RedditURL(currentPath).getSubreddit(),
                );
              }
            } else if (result === "Edit" && pageData?.type === "postDetail") {
              setModal(
                <EditPost
                  edit={pageData}
                  contentSent={() => replaceURL(pageData.link)}
                />,
              );
            } else if (result === "Delete" && pageData?.type === "postDetail") {
              try {
                await deleteUserContent(pageData);
                alert("Post deleted");
                navigation.goBack();
              } catch (_e) {
                alert("Failed to delete post");
              }
            } else if (result === "Message" && pageData?.type === "user") {
              setModal(
                <NewMessage
                  recipient={pageData}
                  contentSent={() => setModal(undefined)}
                />,
              );
            } else if (result === "Block" && pageData?.type === "user") {
              Alert.alert(
                "Block User",
                "Are you sure you want to block this user?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Block",
                    onPress: async () => {
                      await blockUser(pageData);
                      Alert.alert(
                        "User Blocked",
                        "Content from this user will be hidden",
                      );
                    },
                  },
                ],
              );
            } else if (result === "Report") {
              pushURL("hydra://webview/?url=https://www.reddit.com/report");
            } else if (
              result === "Show Seen Posts" ||
              result === "Hide Seen Posts"
            ) {
              toggleHideSeenURL(currentPath);
              replaceURL(currentPath);
            } else if (result === "Sidebar") {
              const subreddit = new RedditURL(currentPath).getSubreddit();
              pushURL(`https://www.reddit.com/r/${subreddit}/about/`);
            } else if (result === "Wiki") {
              const subreddit = new RedditURL(currentPath).getSubreddit();
              pushURL(`https://www.reddit.com/r/${subreddit}/wiki/index`);
            }
          }}
        >
          <Entypo
            name="dots-three-horizontal"
            size={24}
            color={theme.iconOrTextButton}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row",
  },
  centerText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
