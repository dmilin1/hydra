import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import Accounts from "./Pages/Accounts";
import Default from "./Pages/Default";
import Home from "./Pages/Home";
import PostDetails from "./Pages/PostDetails";
import Settings from "./Pages/Settings";
import Subreddit from "./Pages/Subreddit";
import User from "./Pages/User";
import { HistoryContext } from "../../../contexts/HistoryContext";
import {
  ThemeContext,
  t,
} from "../../../contexts/SettingsContexts/ThemeContext";
import RedditURL, { PageType } from "../../../utils/RedditURL";

export default function Navbar() {
  const history = useContext(HistoryContext);
  const { theme } = useContext(ThemeContext);

  const histLayer = history.past.slice(-1)[0];
  const currentPath = histLayer.elem.props.url;

  let pageType = PageType.UNKNOWN;
  try {
    pageType = new RedditURL(currentPath).getPageType();
  } catch {}

  let PageComponent = null;

  if (pageType === PageType.UNKNOWN) {
    PageComponent = Default;
  } else if (pageType === PageType.HOME) {
    PageComponent = Home;
  } else if (pageType === PageType.SUBREDDIT) {
    PageComponent = Subreddit;
  } else if (pageType === PageType.POST_DETAILS) {
    PageComponent = PostDetails;
  } else if (pageType === PageType.USER) {
    PageComponent = User;
  } else if (pageType === PageType.SETTINGS) {
    PageComponent = Settings;
  } else if (pageType === PageType.ACCOUNTS) {
    PageComponent = Accounts;
  } else {
    PageComponent = Default;
  }

  return (
    <View
      style={t(styles.navbarContainer, {
        backgroundColor: theme.background,
        borderBottomColor: theme.tint,
      })}
    >
      <PageComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
});
