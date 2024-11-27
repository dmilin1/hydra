import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons,
  Entypo,
} from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import { Share, StyleSheet, View, TouchableOpacity } from "react-native";

import { StackParamsList, URLRoutes } from "../../../app/stack";
import { ModalContext } from "../../../contexts/ModalContext";
import {
  ThemeContext,
  t,
} from "../../../contexts/SettingsContexts/ThemeContext";
import { SubredditContext } from "../../../contexts/SubredditContext";
import RedditURL, { PageType } from "../../../utils/RedditURL";
import { useURLNavigation } from "../../../utils/navigation";
import useContextMenu from "../../../utils/useContextMenu";
import ContentEditor from "../../Modals/ContentEditor";

type SortTypes =
  | "Best"
  | "Hot"
  | "New"
  | "Top"
  | "Rising"
  | "Controversial"
  | "Old"
  | "Q&A";

type ContextTypes =
  | "Share"
  | "Subscribe"
  | "Unsubscribe"
  | "Favorite"
  | "Unfavorite"
  | "New Post";

type SortAndContextProps = {
  route: RouteProp<StackParamsList, URLRoutes>;
  navigation: NativeStackNavigationProp<StackParamsList, URLRoutes, undefined>;
  sortOptions?: SortTypes[];
  contextOptions?: ContextTypes[];
};

export default function SortAndContext({
  navigation,
  route,
  sortOptions,
  contextOptions,
}: SortAndContextProps) {
  const { theme } = useContext(ThemeContext);
  const { setModal } = useContext(ModalContext);
  const { subscribe, unsubscribe, toggleFavorite } =
    useContext(SubredditContext);

  const { replaceURL } = useURLNavigation(navigation);

  const showContextMenu = useContextMenu();

  const currentPath = route.params.url;
  const pageType = new RedditURL(currentPath).getPageType();
  const currentSort = currentPath ? new RedditURL(currentPath).getSort() : null;

  const changeSort = (sort: string) => {
    const url = new RedditURL(currentPath).changeSort(sort).toString();
    replaceURL(url);
  };

  const handleTopSort = async () => {
    const topSort = await showContextMenu({
      options: ["Hour", "Day", "Week", "Month", "Year", "All"],
    });
    if (topSort) {
      const newUrl = new RedditURL(currentPath)
        .changeSort("top")
        .changeQueryParam("t", topSort.toLowerCase())
        .toString();
      replaceURL(newUrl);
    }
  };

  return (
    <View style={t(styles.sectionContainer, { justifyContent: "flex-end" })}>
      {sortOptions && (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={async () => {
            const sort = await showContextMenu({
              options: sortOptions,
            });
            if (
              sort === "Top" &&
              [PageType.HOME, PageType.SUBREDDIT, PageType.USER].includes(
                pageType,
              )
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
              color={theme.buttonText}
              style={{ marginRight: 20 }}
            />
          )) ||
            (currentSort === "hot" && (
              <SimpleLineIcons
                name="fire"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "new" && (
              <AntDesign
                name="clockcircleo"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "top" && (
              <MaterialCommunityIcons
                name="podium-gold"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "rising" && (
              <MaterialIcons
                name="trending-up"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "controversial" && (
              <MaterialCommunityIcons
                name="sword-cross"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "old" && (
              <MaterialCommunityIcons
                name="timer-sand-complete"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) ||
            (currentSort === "qa" && (
              <AntDesign
                name="message1"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )) || (
              <AntDesign
                name="Trophy"
                size={24}
                color={theme.buttonText}
                style={{ marginRight: 20 }}
              />
            )}
        </TouchableOpacity>
      )}
      {contextOptions && (
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={async () => {
            const result = await showContextMenu({
              options: contextOptions,
            });
            if (result === "Share") {
              Share.share({ url: new RedditURL(currentPath).toString() });
            } else if (result === "New Post") {
              setModal(
                <ContentEditor
                  subreddit={new RedditURL(currentPath).getSubreddit()}
                  mode="makePost"
                  contentSent={() => {}}
                />,
              );
            } else if (result === "Subscribe") {
              subscribe(new RedditURL(currentPath).getSubreddit());
            } else if (result === "Unsubscribe") {
              unsubscribe(new RedditURL(currentPath).getSubreddit());
            } else if (result === "Favorite" || result === "Unfavorite") {
              toggleFavorite(new RedditURL(currentPath).getSubreddit());
            }
          }}
        >
          <Entypo
            name="dots-three-horizontal"
            size={24}
            color={theme.buttonText}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  centerText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
