import { NavigationRoute } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { Fragment, useContext, useRef } from "react";
import { View } from "react-native";

import AccountsScreen from "./AccountsScreen";
import ErrorScreen from "./ErrorScreen";
import HomeScreen from "./HomeScreen";
import InboxScreen from "./InboxScreen";
import MessagesScreen from "./MessagesScreen";
import MultiredditScreen from "./MultiredditScreen";
import PostDetailsScreen from "./PostDetailsScreen";
import PostsScreen from "./PostsScreen";
import SearchScreen from "./SearchScreen";
import SettingsScreen from "./SettingsScreen";
import SubredditsScreen from "./SubredditsScreen";
import UserScreen from "./UserScreen";
import WebviewScreen from "./WebviewScreen";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { StackFutureProvider } from "../../contexts/StackFutureContext";
import SidebarScreen from "./SidebarScreen";
import WikiScreen from "./WikiScreen";
import { GesturesContext } from "../../contexts/SettingsContexts/GesturesContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import SubredditSearchScreen from "./SubredditSearchScreen";
import { TAB_BAR_REMOVED_PADDING_BOTTOM } from "../../constants/TabBarPadding";
import GalleryScreen from "./GalleryScreen";

export type StackParamsList = {
  Subreddits: object;
  Home: {
    url: string;
  };
  InboxPage: object;
  MessagesPage: {
    url: string;
  };
  PostsPage: {
    url: string;
  };
  SubredditSearchPage: {
    url: string;
  };
  PostDetailsPage: {
    url: string;
  };
  MultiredditPage: {
    url: string;
  };
  UserPage: {
    url: string;
  };
  Accounts: {
    url: string;
  };
  WikiPage: {
    url: string;
  };
  GalleryPage: {
    url: string;
  };
  SidebarPage: {
    url: string;
  };
  SettingsPage: {
    url: string;
  };
  SearchPage: object;
  WebviewPage: {
    url: string;
  };
  ErrorPage: {
    url?: string;
  };
};

export type URLRoutes =
  | "Home"
  | "PostsPage"
  | "PostDetailsPage"
  | "SubredditSearchPage"
  | "MultiredditPage"
  | "UserPage"
  | "Accounts"
  | "SettingsPage"
  | "WebviewPage"
  | "SidebarPage"
  | "WikiPage"
  | "GalleryPage";

const SHOWS_BENEATH_TABS: Record<keyof StackParamsList, boolean> = {
  Subreddits: false,
  Home: true,
  InboxPage: true,
  MessagesPage: false,
  PostsPage: true,
  SubredditSearchPage: true,
  PostDetailsPage: true,
  MultiredditPage: true,
  UserPage: true,
  Accounts: false,
  WikiPage: false,
  GalleryPage: false,
  SidebarPage: false,
  SettingsPage: false,
  SearchPage: true,
  WebviewPage: false,
  ErrorPage: false,
};

export type StackPageProps<Pages extends keyof StackParamsList> =
  NativeStackScreenProps<StackParamsList, Pages>;

export default function Stack() {
  const StackNavigator = createNativeStackNavigator<StackParamsList>();
  const { theme } = useContext(ThemeContext);
  const { swipeAnywhereToNavigate } = useContext(GesturesContext);

  const tabBarHeight = useBottomTabBarHeight();

  const futureRoutes = useRef<
    NavigationRoute<StackParamsList, keyof StackParamsList>[]
  >([]);

  const screens = [
    SubredditsScreen,
    HomeScreen,
    InboxScreen,
    MessagesScreen,
    PostsScreen,
    SubredditSearchScreen,
    PostDetailsScreen,
    MultiredditScreen,
    UserScreen,
    AccountsScreen,
    SidebarScreen,
    WikiScreen,
    GalleryScreen,
    SettingsScreen,
    SearchScreen,
    WebviewScreen,
    ErrorScreen,
  ].map((screen) => (
    <Fragment key={screen.name}>{screen({ StackNavigator })}</Fragment>
  ));

  return (
    // Wrapped view is a fix for this bug:
    // https://github.com/expo/expo/issues/39969
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StackNavigator.Navigator
        screenOptions={({ route }) => ({
          headerTintColor: theme.iconOrTextButton.toString(),
          navigationBarColor: theme.background.toString(),
          headerStyle: {
            backgroundColor: theme.background.toString(),
          },
          headerTitleStyle: {
            color: theme.text.toString(),
          },
          fullScreenGestureEnabled: swipeAnywhereToNavigate,
          contentStyle: {
            paddingBottom: SHOWS_BENEATH_TABS[route.name]
              ? 0
              : tabBarHeight - TAB_BAR_REMOVED_PADDING_BOTTOM,
            backgroundColor: theme.background,
          },
        })}
        screenLayout={({ children }) => (
          <StackFutureProvider futureRoutes={futureRoutes}>
            {children}
          </StackFutureProvider>
        )}
      >
        {screens}
      </StackNavigator.Navigator>
    </View>
  );
}
