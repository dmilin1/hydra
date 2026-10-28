import { defineOperation, gql } from "./GqlApi";
import { loadPage } from "./Paging";
import { formatSubredditBase } from "./Subreddits";
import { formatPosts, parseTime, POST_FRAGMENT_VARIABLES } from "./Posts";
import { Post } from "../Posts";
import { SearchResults, SearchType } from "../Search";
import { Subreddit } from "../Subreddits";
import { User } from "../User";
import RedditURL from "../../utils/RedditURL";
import Time from "../../utils/Time";

const SearchPosts = defineOperation(
  "SearchPosts",
  "c3d31b88bfa15180fdcd0c8f6f13b8c0e131d0c981c9b9c8a7c537ddd0ed3348",
);

const SearchPeople = defineOperation(
  "SearchPeople",
  "db3607c1a7deea8441614a053c5f434f60da0c8c931db952f819a59d534d9743",
);

// Reddit's app uses this for its "choose a community" picker. Its full search
// screen uses DynamicSearch, which returns server-driven layout pieces.
const CommunityPickerSearchPaginated = defineOperation(
  "CommunityPickerSearchPaginated",
  "b58025ad0c98bdb93e9dc1db909accf440573bd7d3a48d2c73a02e96d33f1943",
);

const ExploreFeedSdui = defineOperation(
  "ExploreFeedSdui",
  "78c98e9b4f7845ebe3bd5a22f614a84fb77b9e0bd527a73bbf1eb4a8b348183e",
);

const PAGE_SIZE = 25;

// Any value works; Reddit's app sends a surface name.
const PRODUCT_SURFACE = "android";

// Hydra's search sorts (the ?sort= param) to Reddit's SearchPostSort.
const SEARCH_SORTS: Record<string, string> = {
  relevance: "RELEVANCE",
  hot: "HOT",
  new: "NEW",
  top: "TOP",
  comments: "COMMENTS",
};

type SearchOptions = {
  after?: string;
  limit?: number;
  sort?: string;
  time?: string;
  /** Only posts in this subreddit. */
  subreddit?: string;
};

function formatSearchSubreddit(node: any): Subreddit {
  return {
    ...formatSubredditBase(node),
    description: node.publicDescriptionText || "",
    subscribers: node.subscribersCount ?? 0,
    weeklyVisitors: node.communityStats?.weeklyActiveUsersCount ?? undefined,
    after: node.id,
  };
}

function formatSearchUser(node: any): User {
  const createdAt = node.profile?.createdAt
    ? parseTime(node.profile.createdAt)
    : 0;
  return {
    id: node.id.replace(/^t2_/, ""),
    type: "user",
    userName: node.name,
    // Search only has total karma. UserComponent shows the sum.
    postKarma: node.karma?.total ?? 0,
    commentKarma: 0,
    following: node.isFollowed ?? false,
    isLoggedInUser: false,
    after: node.id,
    createdAt,
    timeSinceCreated: new Time(createdAt * 1000).prettyTimeSince() + " old",
  };
}

async function searchPosts(
  text: string,
  options: SearchOptions,
): Promise<Post[]> {
  const sort = SEARCH_SORTS[options.sort?.toLowerCase() ?? ""];
  const filters = [
    ...(options.time ? [{ key: "time_range", value: options.time }] : []),
    ...(options.subreddit
      ? [{ key: "subreddit_names", value: options.subreddit }]
      : []),
  ];
  const listKey = `posts:${text}:${sort}:${options.time}:${options.subreddit}`;
  return await loadPage<Post>(listKey, options.after, async (cursor) => {
    const data = await gql(SearchPosts, {
      ...POST_FRAGMENT_VARIABLES,
      query: text,
      productSurface: PRODUCT_SURFACE,
      pageSize: options.limit ?? PAGE_SIZE,
      ...(cursor ? { afterCursor: cursor } : {}),
      ...(sort ? { sort } : {}),
      ...(filters.length ? { filters } : {}),
    });
    const list = data.search?.general?.posts;
    return {
      items: await formatPosts(
        (list?.edges ?? []).map((edge: any) => edge?.node),
      ),
      ...list?.pageInfo,
    };
  });
}

async function searchUsers(
  text: string,
  options: SearchOptions,
): Promise<User[]> {
  return await loadPage<User>(
    `users:${text}`,
    options.after,
    async (cursor) => {
      const data = await gql(SearchPeople, {
        query: text,
        productSurface: PRODUCT_SURFACE,
        pageSize: options.limit ?? PAGE_SIZE,
        ...(cursor ? { afterCursor: cursor } : {}),
      });
      const list = data.search?.general?.authors;
      return {
        items: (list?.edges ?? [])
          .map((edge: any) => edge?.node)
          .filter((node: any) => node?.__typename === "Redditor" && node.name)
          .map(formatSearchUser),
        ...list?.pageInfo,
      };
    },
  );
}

async function searchSubreddits(
  text: string,
  options: SearchOptions,
): Promise<Subreddit[]> {
  // Hydra used to prefix /r/ here; Reddit now finds short names without it.
  const query = text.trim().replace(/^\/?r\//i, "");
  return await loadPage<Subreddit>(
    `subreddits:${query}`,
    options.after,
    async (cursor) => {
      const data = await gql(CommunityPickerSearchPaginated, {
        query,
        productSurface: PRODUCT_SURFACE,
        first: options.limit ?? PAGE_SIZE,
        ...(cursor ? { after: cursor } : {}),
      });
      const list = data.search?.general?.communities;
      return {
        items: (list?.edges ?? [])
          .map((edge: any) => edge?.node)
          .filter((node: any) => node?.__typename === "Subreddit" && node.name)
          .map(formatSearchSubreddit),
        ...list?.pageInfo,
      };
    },
  );
}

/** Searches posts, users or subreddits. */
export async function getSearchResults<T extends SearchType>(
  type: SearchType,
  text: string,
  options: SearchOptions = {},
): Promise<SearchResults<T>> {
  if (!text.trim()) return [];
  if (type === "posts") {
    return (await searchPosts(text, options)) as SearchResults<T>;
  }
  if (type === "users") {
    return (await searchUsers(text, options)) as SearchResults<T>;
  }
  return (await searchSubreddits(text, options)) as SearchResults<T>;
}

/**
 * Searches one subreddit's posts, from a subreddit search URL
 * (/r/<sub>/search/?q=...&sort=...&t=...).
 */
export async function searchSubredditPosts(
  url: string,
  options: { after?: string } = {},
): Promise<Post[]> {
  const redditURL = new RedditURL(url);
  const query = redditURL.getQueryParam("q")?.trim();
  if (!query) return [];
  const subreddit = redditURL.getSubreddit();
  return await searchPosts(query, {
    after: options.after,
    sort: redditURL.getQueryParam("sort") ?? undefined,
    time: redditURL.getQueryParam("t") ?? undefined,
    // Reddit filters on "all" literally and finds nothing.
    subreddit: ["all", "popular"].includes(subreddit.toLowerCase())
      ? undefined
      : subreddit,
  });
}

// How many subreddits getDiscoverSubreddits() returns.
const DISCOVER_COUNT = 20;

/**
 * Subreddits to discover, from Reddit's Explore feed: its "Recommended for
 * you", curated, popular and topic groups, mixed so each group shows up near
 * the top. Leaves out subreddits the user is subscribed to.
 */
export async function getDiscoverSubreddits(): Promise<Subreddit[]> {
  const data = await gql(ExploreFeedSdui, {
    includeCarouselRecommendations: true,
  });
  const groups: any[][] = (data.exploreFeedV1?.elements?.edges ?? [])
    .map((edge: any) => edge?.node?.communityRecommendations)
    .filter(Array.isArray)
    .map((recommendations: any[]) =>
      recommendations
        .map((recommendation) => recommendation?.subreddit)
        .filter((subreddit: any) => subreddit?.name && !subreddit.isSubscribed),
    );
  const subreddits = new Map<string, Subreddit>();
  for (let i = 0; subreddits.size < DISCOVER_COUNT; i++) {
    const round = groups.map((group) => group[i]).filter(Boolean);
    if (!round.length) break;
    for (const subreddit of round) {
      if (subreddits.size >= DISCOVER_COUNT) break;
      const key = subreddit.name.toLowerCase();
      if (!subreddits.has(key)) {
        subreddits.set(key, formatSearchSubreddit(subreddit));
      }
    }
  }
  return [...subreddits.values()];
}
