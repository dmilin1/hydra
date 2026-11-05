import { Post } from "./Posts";
import { Subreddit } from "./Subreddits";
import { User } from "./User";

export const SearchTypes = ["posts", "subreddits", "users"] as const;
export type SearchType = (typeof SearchTypes)[number];

export type SearchResult = Post | Subreddit | User;

export type SearchResults<T extends SearchType> =
  | never[]
  | (T extends "posts"
      ? Post[]
      : T extends "subreddits"
        ? Subreddit[]
        : User[]);

// reddit.com/search's ?type= values, plus the newer site's names
const URL_TYPES: Record<SearchType, string[]> = {
  posts: ["link", "posts"],
  subreddits: ["sr", "communities"],
  users: ["user", "people"],
};

export function makeSearchURL(query: string, type: SearchType = "posts") {
  return `https://www.reddit.com/search/?q=${encodeURIComponent(query)}&type=${URL_TYPES[type][0]}`;
}

export function getSearchType(urlType: string | null): SearchType {
  return (
    SearchTypes.find((type) => URL_TYPES[type].includes(urlType ?? "")) ??
    "posts"
  );
}
