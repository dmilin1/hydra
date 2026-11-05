import type { TabParamsList } from "../app/tabs";

type TabName = keyof TabParamsList;

// The last tab focused before Search, where search results open
let searchOrigin: Exclude<TabName, "Search"> = "Posts";

export function setSearchOrigin(tab: TabName) {
  if (tab !== "Search") {
    searchOrigin = tab;
  }
}

export const getSearchOrigin = () => searchOrigin;
