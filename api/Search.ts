import "react-native-url-polyfill/auto";
import { Post, formatPostData } from "./Posts";
import { api } from "./RedditApi";
import { Subreddit, formatSubredditData } from "./Subreddits";
import { User, formatUserData } from "./User";
import RedditURL from "../utils/RedditURL";

export const SearchTypes = ["posts", "subreddits", "users"] as const;
export type SearchType = (typeof SearchTypes)[number];

type SearchOptions = {
  sort?: string;
  limit?: string;
  after?: string;
  time?: "all" | "year" | "month" | "week" | "day" | "hour";
  sr_detail?: "true" | "false";
};

export type SearchResult = Post | Subreddit | User;

type SearchResults<T extends SearchType> =
  | never[]
  | (T extends "posts"
      ? Post[]
      : T extends "subreddits"
        ? Subreddit[]
        : User[]);

export async function getSearchResults<T extends SearchType>(
  type: SearchType,
  text: string,
  options: SearchOptions = {},
): Promise<SearchResults<T>> {
  const typeMap = {
    posts: "link",
    subreddits: "sr",
    users: "user",
  };
  const redditURL = new RedditURL(`https://www.reddit.com/search/`);
  redditURL.setQueryParams({
    type: typeMap[type],
    q: text,
    sr_detail: "true",
    ...options,
  });
  redditURL.jsonify();
  const res = await api(redditURL.toString());
  if (!res.data) return [];
  const results = (
    await Promise.all(
      res.data.children.map(async (child: any) => {
        if (child.kind === "t3") {
          return await formatPostData(child);
        }
        if (child.kind === "t5") {
          return formatSubredditData(child);
        }
        if (child.kind === "t2") {
          if (!child.data.id) return;
          return formatUserData(child.data);
        }
      }),
    )
  ).filter((result: any) => result !== undefined);
  return results as never[];
}
