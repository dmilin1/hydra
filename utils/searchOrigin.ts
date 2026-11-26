import {
  NavigationHelpers,
  StackActions,
  TabActions,
} from "@react-navigation/native";

import type { StackParamsList, URLRoutes } from "../app/stack";
import type { TabParamsList } from "../app/tabs";

type TabName = keyof TabParamsList;

// The last tab focused before Search, where search results open
let searchOrigin: Exclude<TabName, "Search"> = "Posts";

// Until a stack first navigates, the tab state only holds a stale, keyless copy of it, so actions can't target it from there
const tabStacks: Partial<Record<TabName, NavigationHelpers<StackParamsList>>> =
  {};

export function setSearchOrigin(tab: TabName) {
  if (tab !== "Search") {
    searchOrigin = tab;
  }
}

export const getSearchOrigin = () => searchOrigin;

export function registerTabStack(
  tab: TabName,
  navigation: NavigationHelpers<StackParamsList>,
) {
  tabStacks[tab] = navigation;
}

export const getOriginStack = () => tabStacks[searchOrigin];

// Returns false if the origin tab's stack isn't mounted, so the caller can push on its own stack instead
export function pushOnOriginTab(screen: URLRoutes, url: string) {
  const stack = tabStacks[searchOrigin];
  if (!stack) return false;
  stack.getParent()?.dispatch(TabActions.jumpTo(searchOrigin));
  stack.dispatch(StackActions.push(screen, { url }));
  return true;
}
