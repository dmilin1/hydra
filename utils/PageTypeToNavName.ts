import { StackParamsList } from "../app/stack";
import { PageType } from "./RedditURL";

export const PageTypeToNavName: Record<PageType, keyof StackParamsList> = {
  [PageType.HOME]: "Home",
  [PageType.POST_DETAILS]: "PostDetailsPage",
  [PageType.SUBREDDIT]: "PostsPage",
  [PageType.SUBREDDIT_SEARCH]: "SubredditSearchPage",
  [PageType.MULTIREDDIT]: "MultiredditPage",
  [PageType.USER]: "UserPage",
  [PageType.SEARCH]: "SearchPage",
  [PageType.INBOX]: "InboxPage",
  [PageType.MESSAGES]: "MessagesPage",
  [PageType.ACCOUNTS]: "Accounts",
  [PageType.SIDEBAR]: "SidebarPage",
  [PageType.WIKI]: "WikiPage",
  [PageType.SETTINGS]: "SettingsPage",
  [PageType.WEBVIEW]: "WebviewPage",
  [PageType.IMAGE]: "ErrorPage",
  [PageType.UNKNOWN]: "ErrorPage",
};
