import { NavigationRoute } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { Fragment, useContext, useRef } from "react";

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
  | "MultiredditPage"
  | "UserPage"
  | "Accounts"
  | "SettingsPage"
  | "WebviewPage"
  | "SidebarPage"
  | "WikiPage";

const SHOWS_BENEATH_TABS: Record<keyof StackParamsList, boolean> = {
  Subreddits: false,
  Home: true,
  InboxPage: true,
  MessagesPage: false,
  PostsPage: true,
  PostDetailsPage: true,
  MultiredditPage: true,
  UserPage: true,
  Accounts: false,
  WikiPage: false,
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
    PostDetailsScreen,
    MultiredditScreen,
    UserScreen,
    AccountsScreen,
    SidebarScreen,
    WikiScreen,
    SettingsScreen,
    SearchScreen,
    WebviewScreen,
    ErrorScreen,
  ].map((screen) => (
    <Fragment key={screen.name}>{screen({ StackNavigator })}</Fragment>
  ));

  return (
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
          paddingBottom: SHOWS_BENEATH_TABS[route.name] ? 0 : tabBarHeight,
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
  );
}
