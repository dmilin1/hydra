import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SplashScreen, useNavigation } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainerRef, StackActions } from "@react-navigation/native";

import LoadingSplash from "../../components/UI/LoadingSplash";
import { AccountContext } from "../../contexts/AccountContext";
import { InboxContext } from "../../contexts/InboxContext";
import { TabSettingsContext } from "../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import Stack from "../stack";
import { TabScrollContext } from "../../contexts/TabScrollContext";
import useHandleIncomingURLs from "../../utils/useHandleIncomingURLs";
import { AppNavigationProp } from "../../utils/navigationTypes";
import { expoDb } from "../../db";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import QuickSubredditSearch from "../../components/Modals/QuickSubredditSearch";
import { oneTimeAlert } from "../../utils/oneTimeAlert";

export type TabParamsList = {
  Posts: undefined;
  Inbox: undefined;
  Account: undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator();

const TAB_BAR_HEIGHT = 90;

export default function Tabs() {
  if (__DEV__) {
    // Not a real conditional render since __DEV__ is a compile time constant
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDrizzleStudio(expoDb);
    // This is here because the db must be set up before the hook is used
  }

  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();

  const { theme } = useContext(ThemeContext);
  const { loginInitialized, currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);
  const { showUsername } = useContext(TabSettingsContext);
  const { tabBarTranslateY } = useContext(TabScrollContext);

  const [showSubredditSearch, setShowSubredditSearch] = useState(false);

  useHandleIncomingURLs();

  useEffect(() => {
    if (loginInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loginInitialized]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["right", "top", "left"]}
    >
      <QuickSubredditSearch
        show={showSubredditSearch}
        onExit={() => setShowSubredditSearch(false)}
      />
      {loginInitialized ? (
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              position: "absolute",
              bottom: 0,
              backgroundColor: theme.background,
              borderTopWidth: 0,
              transform: [
                {
                  translateY: tabBarTranslateY.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, TAB_BAR_HEIGHT],
                  }),
                },
              ],
              opacity: tabBarTranslateY.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          }}
          screenListeners={() => ({
            tabPress: (e) => {
              const state = navigation.getState();
              const stackItem = state.routes[state.index];
              const isCurrentTab = stackItem.key === e.target;
              const stackHeight = stackItem.state?.index;
              if (isCurrentTab && stackHeight && stackHeight > 0) {
                navigation.dispatch(StackActions.pop());
                e.preventDefault();
              }
              if (e.target?.startsWith("Search")) {
                oneTimeAlert(
                  "quickSearchGuideAlert",
                  "Did you know?",
                  "You can quick search for subreddits by long pressing the search tab.",
                );
              }
            },
            tabLongPress: (e) => {
              if (e.target?.startsWith("Search")) {
                setShowSubredditSearch(true);
              }
            },
          })}
        >
          <Tab.Screen
            name="Posts"
            options={{
              title: "Posts",
              headerShown: false,
              tabBarIcon: ({ focused, size }) => (
                <MaterialCommunityIcons
                  name="post"
                  size={size}
                  color={focused ? theme.iconPrimary : theme.subtleText}
                />
              ),
              tabBarActiveTintColor: theme.iconOrTextButton as string,
              tabBarInactiveTintColor: theme.subtleText as string,
              tabBarLabel: "Posts",
              animation: "fade",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Inbox"
            options={{
              title: "Inbox",
              headerShown: false,
              tabBarIcon: ({ focused, size }) => (
                <Entypo
                  name="mail"
                  size={size}
                  color={focused ? theme.iconPrimary : theme.subtleText}
                />
              ),
              tabBarActiveTintColor: theme.iconOrTextButton as string,
              tabBarInactiveTintColor: theme.subtleText as string,
              tabBarLabel: "Inbox",
              tabBarBadge: inboxCount > 0 ? inboxCount : undefined,
              animation: "fade",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Account"
            options={{
              title: currentUser?.userName ?? "Accounts",
              headerShown: false,
              tabBarIcon: ({ focused, size }) => (
                <MaterialIcons
                  name="account-circle"
                  size={size}
                  color={focused ? theme.iconPrimary : theme.subtleText}
                />
              ),
              tabBarActiveTintColor: theme.iconOrTextButton as string,
              tabBarInactiveTintColor: theme.subtleText as string,
              tabBarLabel: showUsername
                ? (currentUser?.userName ?? "Account")
                : "Account",
              animation: "fade",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Search"
            options={{
              title: "Search",
              headerShown: false,
              tabBarIcon: ({ focused, size }) => (
                <AntDesign
                  name="search1"
                  size={size}
                  color={focused ? theme.iconPrimary : theme.subtleText}
                />
              ),
              tabBarActiveTintColor: theme.iconOrTextButton as string,
              tabBarInactiveTintColor: theme.subtleText as string,
              tabBarLabel: "Search",
              animation: "fade",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Settings"
            options={{
              title: "Settings",
              headerShown: false,
              tabBarIcon: ({ focused, size }) => (
                <Ionicons
                  name="settings-sharp"
                  size={size}
                  color={focused ? theme.iconPrimary : theme.subtleText}
                />
              ),
              tabBarActiveTintColor: theme.iconOrTextButton as string,
              tabBarInactiveTintColor: theme.subtleText as string,
              tabBarLabel: "Settings",
              animation: "fade",
            }}
            component={Stack}
          />
        </Tab.Navigator>
      ) : (
        <LoadingSplash />
      )}
    </SafeAreaView>
  );
}
