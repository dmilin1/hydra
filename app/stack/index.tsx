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
import SubredditSearchScreen from "./SubredditSearchScreen";
import { useTabBarInsets } from "../../contexts/TabBarInsetsContext";
import { USES_NATIVE_TAB_BAR_MINIMIZE } from "../../contexts/TabScrollContext";
import {
  GlassHeaderInsetProvider,
  IS_LIQUID_GLASS,
  StatusBarTapShield,
} from "../../utils/liquidGlass";
import GalleryScreen from "./GalleryScreen";
import ChatScreen from "./ChatScreen";

export type StackParamsList = {
  Subreddits: undefined;
  Home: {
    url: string;
  };
  InboxPage: undefined;
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
  SearchPage: undefined;
  WebviewPage: {
    url: string;
  };
  ChatPage: {
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
  | "GalleryPage"
  | "ChatPage";

// On iOS 26 these scroll under the glass bar via TabBarScrollView too
const SHOWS_BENEATH_TABS: Record<keyof StackParamsList, boolean> = {
  Subreddits: USES_NATIVE_TAB_BAR_MINIMIZE,
  Home: true,
  InboxPage: true,
  PostsPage: true,
  SubredditSearchPage: true,
  PostDetailsPage: true,
  MultiredditPage: true,
  UserPage: true,
  Accounts: false,
  WikiPage: false,
  ChatPage: false,
  GalleryPage: USES_NATIVE_TAB_BAR_MINIMIZE,
  SidebarPage: USES_NATIVE_TAB_BAR_MINIMIZE,
  SettingsPage: USES_NATIVE_TAB_BAR_MINIMIZE,
  SearchPage: true,
  WebviewPage: false,
  ErrorPage: false,
};

// Main content is a TabBarScrollView with nothing fixed above it, so it can scroll under a glass header
const GLASS_HEADER_ROUTES = new Set<keyof StackParamsList>([
  "Subreddits",
  "Home",
  "InboxPage",
  "PostsPage",
  "SubredditSearchPage",
  "PostDetailsPage",
  "MultiredditPage",
  "UserPage",
  "GalleryPage",
  "SidebarPage",
  "SettingsPage",
]);

export type StackPageProps<Pages extends keyof StackParamsList> =
  NativeStackScreenProps<StackParamsList, Pages>;

export default function Stack() {
  const StackNavigator = createNativeStackNavigator<StackParamsList>();
  const { theme } = useContext(ThemeContext);
  const { swipeAnywhereToNavigate } = useContext(GesturesContext);

  const tabBarInsets = useTabBarInsets();

  const futureRoutes = useRef<
    NavigationRoute<StackParamsList, keyof StackParamsList>[]
  >([]);

  const screens = [
    SubredditsScreen,
    HomeScreen,
    InboxScreen,
    PostsScreen,
    SubredditSearchScreen,
    PostDetailsScreen,
    MultiredditScreen,
    UserScreen,
    AccountsScreen,
    SidebarScreen,
    WikiScreen,
    ChatScreen,
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
          headerTransparent:
            IS_LIQUID_GLASS && GLASS_HEADER_ROUTES.has(route.name),
          headerStyle:
            IS_LIQUID_GLASS && GLASS_HEADER_ROUTES.has(route.name)
              ? undefined
              : { backgroundColor: theme.background.toString() },
          headerTitleStyle: {
            color: theme.text.toString(),
          },
          fullScreenGestureEnabled: swipeAnywhereToNavigate,
          contentStyle: {
            paddingBottom: SHOWS_BENEATH_TABS[route.name]
              ? 0
              : tabBarInsets.bottom,
            paddingLeft: tabBarInsets.left,
            paddingRight: tabBarInsets.right,
            // Pages rely on this instead of their own root background; see TabBarScrollView
            backgroundColor: theme.background,
          },
        })}
        screenLayout={({ route, children }) => (
          <StackFutureProvider futureRoutes={futureRoutes}>
            <GlassHeaderInsetProvider>
              {children}
              {IS_LIQUID_GLASS && GLASS_HEADER_ROUTES.has(route.name) ? (
                <StatusBarTapShield />
              ) : null}
            </GlassHeaderInsetProvider>
          </StackFutureProvider>
        )}
      >
        {screens}
      </StackNavigator.Navigator>
    </View>
  );
}
