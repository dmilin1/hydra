import React, { Fragment, useContext } from "react";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import PostsScreen from "./PostsScreen";
import SubredditsScreen from "./SubredditsScreen";
import HomeScreen from "./HomeScreen";
import AccountsScreen from "./AccountsScreen";
import MessagesScreen from "./MessagesScreen";
import PostDetailsScreen from "./PostDetailsScreen";
import UserScreen from "./UserScreen";
import SettingsScreen from "./SettingsScreen";
import SearchScreen from "./SearchScreen";
import ErrorScreen from "./ErrorScreen";

export type StackParamsList = {
    Subreddits: {};
    Home: {
        url: string;
    };
    MessagesPage: {};
    PostsPage: {
        url: string;
    };
    PostDetailsPage: {
        url: string;
    };
    UserPage: {
        url: string;
    };
    Accounts: {};
    SettingsPage: {
        url: string;
    };
    SearchPage: {};
    ErrorPage: {};
};

export type URLRoutes = 'Home' | 'PostsPage' | 'PostDetailsPage' | 'UserPage' | 'SettingsPage';

export type StackPageProps<Pages extends keyof StackParamsList> = NativeStackScreenProps<StackParamsList, Pages>

export default function Stack() {
    const StackNavigator = createNativeStackNavigator<StackParamsList>();
    const { theme } = useContext(ThemeContext);

    const screens = [
        SubredditsScreen,
        HomeScreen,
        MessagesScreen,
        PostsScreen,
        PostDetailsScreen,
        UserScreen,
        AccountsScreen,
        SettingsScreen,
        SearchScreen,
        ErrorScreen,
    ].map((screen) => (
        <Fragment key={screen.name}>
            {screen({ StackNavigator })}
        </Fragment>
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
        >
            {screens}
        </StackNavigator.Navigator>
    );
}
