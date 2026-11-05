import { createNativeBottomTabNavigator } from "@react-navigation/bottom-tabs/unstable";
import * as SplashScreen from "expo-splash-screen";
import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import {
  NavigationContainerRef,
  StackActions,
  useNavigation,
} from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import LoadingSplash from "../../components/UI/LoadingSplash";
import { AccountContext } from "../../contexts/AccountContext";
import { InboxContext } from "../../contexts/InboxContext";
import { TabSettingsContext } from "../../contexts/SettingsContexts/TabSettingsContext";
import { ThemeContext } from "../../contexts/SettingsContexts/ThemeContext";
import Stack from "../stack";
import {
  TabBarHiddenContext,
  TabScrollContext,
  USES_NATIVE_TAB_BAR_MINIMIZE,
} from "../../contexts/TabScrollContext";
import { TabBarInsetsProvider } from "../../contexts/TabBarInsetsContext";
import useHandleIncomingURLs from "../../utils/useHandleIncomingURLs";
import { AppNavigationProp } from "../../utils/navigationTypes";
import useTabIcons from "../../utils/useTabIcons";
import { expoDb } from "../../db";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import QuickAccountSwap from "../../components/Modals/QuickAccountSwap";
import { HAS_SEARCH_TAB_ROLE } from "../../utils/liquidGlass";
import { setSearchOrigin } from "../../utils/searchOrigin";

export type TabParamsList = {
  Posts: undefined;
  Inbox: undefined;
  Account: undefined;
  Search: undefined;
  Settings: undefined;
};

const Tab = createNativeBottomTabNavigator<TabParamsList>();

// Glass tab items grow with their title; keep a long username from widening the Account tab
const MAX_TAB_LABEL_LENGTH = 10;
const shortLabel = (label: string) =>
  label.length > MAX_TAB_LABEL_LENGTH
    ? `${label.slice(0, MAX_TAB_LABEL_LENGTH - 1)}…`
    : label;

export default function Tabs() {
  if (__DEV__) {
    // Not a real conditional render since __DEV__ is a compile time constant
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDrizzleStudio(expoDb);
    // This is here because the db must be set up before the hook is used
  }

  const navigation = useNavigation<NavigationContainerRef<AppNavigationProp>>();

  const { theme } = useContext(ThemeContext);
  const { loginInitialized, currentUser, accounts } =
    useContext(AccountContext);
  const { inboxCount } = useContext(InboxContext);
  const { showUsername, hideTabsOnScroll } = useContext(TabSettingsContext);
  const tabBarHidden = useContext(TabBarHiddenContext);
  const { showTabBar } = useContext(TabScrollContext);
  const tabIcons = useTabIcons();

  const [showAccountSwap, setShowAccountSwap] = useState(false);

  useHandleIncomingURLs();

  useEffect(() => {
    if (loginInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loginInitialized]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <QuickAccountSwap
        show={showAccountSwap}
        onExit={() => setShowAccountSwap(false)}
      />
      {loginInitialized && tabIcons ? (
        <Tab.Navigator
          screenOptions={{
            lazy: true,
            tabBarActiveTintColor: theme.iconPrimary as string,
            tabBarInactiveTintColor: theme.subtleText as string,
            // Explicit so native tabs don't parse the tint with color.js, which throws on malformed custom theme colors
            tabBarActiveIndicatorColor: theme.tint,
            tabBarLabelVisibilityMode: "labeled",
            tabBarStyle: {
              backgroundColor: theme.background,
              display: tabBarHidden ? "none" : "flex",
            },
            tabBarMinimizeBehavior: USES_NATIVE_TAB_BAR_MINIMIZE
              ? hideTabsOnScroll
                ? "onScrollDown"
                : "none"
              : undefined,
            // Re-taps are handled in tabPress below
            tabBarRepeatedPressBehavior: {
              popToTop: false,
              scrollToTop: false,
            },
            // Screens pad themselves from TabBarInsetsContext instead
            overrideScrollViewContentInsetAdjustmentBehavior: false,
          }}
          screenLayout={({ children }) => (
            <TabBarInsetsProvider>{children}</TabBarInsetsProvider>
          )}
          screenListeners={({ route }) => ({
            focus: () => {
              // A hidden bar would otherwise stay hidden on a tab it was never scrolled away on
              showTabBar();
              setSearchOrigin(route.name);
            },
            tabPress: (e) => {
              // Fires before the switch, so state still holds the previous tab
              const state = navigation.getState();
              const stackItem = state.routes[state.index];
              if (stackItem.key !== e.target) return;
              if ((stackItem.state?.index ?? 0) > 0) {
                navigation.dispatch(StackActions.pop());
                return;
              }
              // Native tabs have no long press, so re-tapping a tab at its root opens its shortcut
              if (e.target?.startsWith("Account") && accounts.length > 0) {
                setShowAccountSwap(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            },
          })}
        >
          <Tab.Screen
            name="Posts"
            options={{
              title: "Posts",
              tabBarIcon: tabIcons.Posts,
              tabBarLabel: "Posts",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Inbox"
            options={{
              title: "Inbox",
              tabBarIcon: tabIcons.Inbox,
              tabBarLabel: "Inbox",
              tabBarBadge: inboxCount > 0 ? inboxCount : undefined,
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Account"
            options={{
              title: currentUser?.userName ?? "Accounts",
              tabBarIcon: tabIcons.Account,
              tabBarLabel: showUsername
                ? shortLabel(currentUser?.userName ?? "Account")
                : "Account",
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Search"
            options={{
              title: "Search",
              tabBarIcon: tabIcons.Search,
              tabBarLabel: "Search",
              // Sits apart from the other tabs and becomes the search field when tapped
              ...(HAS_SEARCH_TAB_ROLE && {
                tabBarRole: "search",
                tabBarSearchAutoFocus: true,
              }),
            }}
            component={Stack}
          />
          <Tab.Screen
            name="Settings"
            options={{
              title: "Settings",
              tabBarIcon: tabIcons.Settings,
              tabBarLabel: "Settings",
            }}
            component={Stack}
          />
        </Tab.Navigator>
      ) : (
        <LoadingSplash />
      )}
    </View>
  );
}
