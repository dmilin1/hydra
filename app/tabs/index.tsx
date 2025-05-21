import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SplashScreen } from "expo-router";
import React, { useContext, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import LoadingSplash from "../../components/UI/LoadingSplash";
import { AccountContext } from "../../contexts/AccountContext";
import { InboxContext } from "../../contexts/InboxContext";
import { TabSettingsContext } from "../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import Stack from "../stack";

export type TabParamsList = {
  Posts: undefined;
  Inbox: undefined;
  Account: undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const { theme } = useContext(ThemeContext);
  const { loginInitialized, currentUser } = useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);
  const { showUsername } = useContext(TabSettingsContext);

  const tabBarStyle = {
    backgroundColor: theme.background,
    borderTopWidth: 0,
  };

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
      {loginInitialized ? (
        <Tab.Navigator>
          <Tab.Screen
            name="Posts"
            options={{
              title: "Posts",
              headerShown: false,
              tabBarStyle,
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
              tabBarStyle,
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
              tabBarStyle,
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
              tabBarStyle,
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
              tabBarStyle,
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
