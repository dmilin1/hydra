import KeyStore from "./KeyStore";
import URL from "./URL";
import {
  DEFAULT_COMMENT_SORT_KEY,
  DEFAULT_POST_SORT_KEY,
  DEFAULT_POST_SORT_TOP_KEY,
  makeCommentSubredditSortKey,
  makePostSubredditSortKey,
  makePostSubredditSortTopKey,
  REMEMBER_COMMENT_SUBREDDIT_SORT_KEY,
  REMEMBER_POST_SUBREDDIT_SORT_KEY,
} from "../constants/SettingsKeys";

export enum PageType {
  HOME,
  POST_DETAILS,
  SUBREDDIT,
  MULTIREDDIT,
  USER,
  SEARCH,
  INBOX,

  MESSAGES,

  ACCOUNTS,
  SETTINGS,

  IMAGE,

  UNKNOWN,
}

export default class RedditURL extends URL {
  url: string;

  constructor(url: string) {
    super(url);
    if (
      /* Override super() call if short reddit link */
      url.startsWith("/r") ||
      url.startsWith("/u") ||
      url.startsWith("/user") ||
      url.startsWith("/search")
    ) {
      this.url = `https://www.reddit.com${url}`;
    } else if (url.startsWith("hydra://")) {
      this.url = url;
    } else if (url.startsWith("https://")) {
      this.url = url;
    } else if (url.startsWith("www")) {
      this.url = `https://${url}`;
    } else if (url.startsWith("reddit.com")) {
      this.url = `https://www.${url}`;
    } else {
      throw new Error(`Weird URL being passed ${url}`);
    }
    if (
      !this.url.startsWith("hydra://") &&
      !this.url.startsWith("https://www.reddit.com") &&
      !this.url.startsWith("https://i.redd.it") &&
      !this.url.startsWith("https://v.redd.it") &&
      !this.url.startsWith("https://redd.it")
    ) {
      throw new Error("Not a reddit URL");
    }
  }

  getSort(): string | null {
    const pageType = this.getPageType();
    if ([PageType.HOME, PageType.SUBREDDIT].includes(pageType)) {
      const sort = this.url.split(/\/r\/|\/|\?/).slice(3, 5) ?? [];
      for (const check of ["best", "hot", "new", "top", "rising"]) {
        if (sort.includes(check)) {
          return check;
        }
      }
    } else if (pageType === PageType.POST_DETAILS) {
      return this.getQueryParam("sort");
    } else if (pageType === PageType.USER) {
      return this.getQueryParam("sort") ?? "new";
    }
    return null;
  }

  changeSort(sort: string, time?: string): RedditURL {
    const subreddit = this.getSubreddit();
    const urlParams = this.getURLParams();
    const pageType = this.getPageType();
    if (sort === "Q&A") {
      sort = "qa";
    }
    if (pageType === PageType.HOME) {
      this.url = `https://www.reddit.com/${sort.toLowerCase()}/?${urlParams}`;
    } else if (pageType === PageType.SUBREDDIT) {
      this.url = `https://www.reddit.com/r/${subreddit}/${sort.toLowerCase()}/?${urlParams}`;
    } else if (pageType === PageType.POST_DETAILS) {
      this.changeQueryParam("sort", sort.toLowerCase());
    } else if (pageType === PageType.MULTIREDDIT) {
      const pathParts = this.getRelativePath().split("/");
      pathParts[5] = sort.toLowerCase();
      this.url = `https://www.reddit.com${pathParts.join("/")}?${urlParams}`;
    } else if (pageType === PageType.USER) {
      this.changeQueryParam("sort", sort.toLowerCase());
    }
    if (time) {
      this.changeQueryParam("t", time.toLowerCase());
    }
    return this;
  }

  getSubreddit(): string {
    return this.url.split("/r/")[1]?.split(/\/|\?/)[0] ?? "";
  }

  jsonify(): RedditURL {
    const base = this.getBasePath();
    const urlParams = this.getURLParams();
    this.url = `${base}.json?${urlParams}`;
    return this;
  }

  getPageType(): PageType {
    const relativePath = this.getRelativePath();
    if (this.url.startsWith("hydra://accounts")) {
      return PageType.ACCOUNTS;
    } else if (this.url.startsWith("hydra://settings")) {
      return PageType.SETTINGS;
    } else if (
      relativePath === "" ||
      relativePath === "/" ||
      relativePath.startsWith("/best") ||
      relativePath.startsWith("/hot") ||
      relativePath.startsWith("/new") ||
      relativePath.startsWith("/top") ||
      relativePath.startsWith("/rising")
    ) {
      return PageType.HOME;
    } else if (relativePath.includes("/comments/")) {
      return PageType.POST_DETAILS;
    } else if (relativePath.startsWith("/r/")) {
      return PageType.SUBREDDIT;
    } else if (relativePath.startsWith("/message/inbox")) {
      return PageType.INBOX;
    } else if (relativePath.startsWith("/message/messages")) {
      return PageType.MESSAGES;
    } else if (relativePath.match(/\/(user|u)\/.*\/m\/.*/)) {
      return PageType.MULTIREDDIT;
    } else if (
      relativePath.startsWith("/u/") ||
      relativePath.startsWith("/user/")
    ) {
      return PageType.USER;
    } else if (relativePath.startsWith("/search")) {
      return PageType.SEARCH;
    } else if (this.url.startsWith("https://i.redd.it")) {
      return PageType.IMAGE;
    } else {
      return PageType.UNKNOWN;
    }
  }

  getPageName(): string {
    let name = "";
    const pageType = this.getPageType();
    if (pageType === PageType.HOME) {
      const relativePath = this.getRelativePath();
      name = relativePath.split("/")[1];
      name = name ? name : "Home";
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else if (pageType === PageType.POST_DETAILS) {
      name = this.getSubreddit();
    } else if (pageType === PageType.SUBREDDIT) {
      name = this.getSubreddit();
    } else if (pageType === PageType.USER) {
      name = this.getRelativePath().split("/")[2] ?? "User";
    } else if (pageType === PageType.SEARCH) {
      name = "Search";
    } else if (pageType === PageType.ACCOUNTS) {
      name = "Accounts";
    } else if (pageType === PageType.SETTINGS) {
      const route = this.getRelativePath().split("/").slice(-1)[0];
      name = route.replace(/([A-Z])/g, " $1").trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else if (pageType === PageType.UNKNOWN) {
      name = "Error";
    }
    return name;
  }

  /**
   * Properly formats shortened URLs and forwarded URLs
   */
  async resolveURL(): Promise<RedditURL> {
    if (this.getRelativePath().startsWith("/u/")) {
      this.url = this.url.replace("/u/", "/user/");
      return this;
    }
    if (this.getPageType() !== PageType.UNKNOWN) {
      return this;
    }
    const response = await fetch(this.url, {
      method: "HEAD",
      redirect: "follow",
    });
    this.url = response.url;
    return this;
  }

  applyPreferredSorts(): RedditURL {
    const pageType = this.getPageType();
    const existingSort = this.getSort();
    if (existingSort) return this;

    if (pageType === PageType.SUBREDDIT) {
      const subreddit = this.getSubreddit();
      const subredditSpecificSort = KeyStore.getBoolean(
        REMEMBER_POST_SUBREDDIT_SORT_KEY,
      )
        ? KeyStore.getString(makePostSubredditSortKey(subreddit))
        : null;
      const preferredSort =
        subredditSpecificSort ??
        KeyStore.getString(DEFAULT_POST_SORT_KEY) ??
        "default";
      if (preferredSort !== "default") {
        let time = undefined;
        if (preferredSort === "top") {
          const subredditSpecificTime = KeyStore.getBoolean(
            REMEMBER_POST_SUBREDDIT_SORT_KEY,
          )
            ? KeyStore.getString(makePostSubredditSortTopKey(subreddit))
            : null;
          time =
            subredditSpecificTime ??
            KeyStore.getString(DEFAULT_POST_SORT_TOP_KEY) ??
            "all";
        }
        this.changeSort(preferredSort, time);
      }
    }

    if (pageType === PageType.POST_DETAILS) {
      const subreddit = this.getSubreddit();
      const subredditSpecificSort = KeyStore.getBoolean(
        REMEMBER_COMMENT_SUBREDDIT_SORT_KEY,
      )
        ? KeyStore.getString(makeCommentSubredditSortKey(subreddit))
        : null;
      const preferredSort =
        subredditSpecificSort ??
        KeyStore.getString(DEFAULT_COMMENT_SORT_KEY) ??
        "default";
      if (preferredSort !== "default") {
        this.changeSort(preferredSort);
      }
    }

    return this;
  }
}
