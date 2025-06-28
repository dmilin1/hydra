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
import ConditionalWrapper from "../../components/Other/ConditionalWrapper";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { StackFutureProvider } from "../../contexts/StackFutureContext";
import IncomingURLHandler from "../../utils/IncomingURLHandler";
import SidebarScreen from "./SidebarScreen";
import WikiScreen from "./WikiScreen";
import { GesturesContext } from "../../contexts/SettingsContexts/GesturesContext";

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

export type StackPageProps<Pages extends keyof StackParamsList> =
  NativeStackScreenProps<StackParamsList, Pages>;

export default function Stack() {
  const StackNavigator = createNativeStackNavigator<StackParamsList>();
  const { theme } = useContext(ThemeContext);
  const { swipeAnywhereToNavigate } = useContext(GesturesContext);

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
      screenOptions={{
        headerTintColor: theme.iconOrTextButton.toString(),
        navigationBarColor: theme.background.toString(),
        headerStyle: {
          backgroundColor: theme.background.toString(),
        },
        headerTitleStyle: {
          color: theme.text.toString(),
        },
        fullScreenGestureEnabled: swipeAnywhereToNavigate,
      }}
      screenLayout={({ children, route }) => (
        <StackFutureProvider futureRoutes={futureRoutes}>
          <ConditionalWrapper
            condition={route.name === "Subreddits"}
            wrapper={IncomingURLHandler}
          >
            {children}
          </ConditionalWrapper>
        </StackFutureProvider>
      )}
    >
      {screens}
    </StackNavigator.Navigator>
  );
}
