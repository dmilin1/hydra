import { NavigationRoute } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import React, { Fragment, useContext, useRef } from "react";

import AccountsScreen from "./AccountsScreen";
import ErrorScreen from "./ErrorScreen";
import HomeScreen from "./HomeScreen";
import MessagesScreen from "./MessagesScreen";
import MultiredditScreen from "./MultiredditScreen";
import PostDetailsScreen from "./PostDetailsScreen";
import PostsScreen from "./PostsScreen";
import SearchScreen from "./SearchScreen";
import SettingsScreen from "./SettingsScreen";
import SubredditsScreen from "./SubredditsScreen";
import UserScreen from "./UserScreen";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import { StackFutureProvider } from "../../contexts/StackFutureContext";

export type StackParamsList = {
  Subreddits: object;
  Home: {
    url: string;
  };
  MessagesPage: object;
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
  SettingsPage: {
    url: string;
  };
  SearchPage: object;
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
  | "SettingsPage";

export type StackPageProps<Pages extends keyof StackParamsList> =
  NativeStackScreenProps<StackParamsList, Pages>;

export default function Stack() {
  const StackNavigator = createNativeStackNavigator<StackParamsList>();
  const { theme } = useContext(ThemeContext);

  const futureRoutes = useRef<
    NavigationRoute<StackParamsList, keyof StackParamsList>[]
  >([]);

  const screens = [
    SubredditsScreen,
    HomeScreen,
    MessagesScreen,
    PostsScreen,
    PostDetailsScreen,
    MultiredditScreen,
    UserScreen,
    AccountsScreen,
    SettingsScreen,
    SearchScreen,
    ErrorScreen,
  ].map((screen) => (
    <Fragment key={screen.name}>{screen({ StackNavigator })}</Fragment>
  ));

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerTintColor: theme.buttonText.toString(),
        navigationBarColor: theme.background.toString(),
        headerStyle: {
          backgroundColor: theme.background.toString(),
        },
        headerTitleStyle: {
          color: theme.text.toString(),
        },
      }}
      screenLayout={(props) => (
        <StackFutureProvider {...props} futureRoutes={futureRoutes} />
      )}
    >
      {screens}
    </StackNavigator.Navigator>
  );
}
