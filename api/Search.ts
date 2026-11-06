import { Post } from "./Posts";
import { Subreddit } from "./Subreddits";
import { User } from "./User";

export const SearchOptions = [
  { value: "posts", label: "Posts" },
  { value: "subreddits", label: "Subreddits" },
  { value: "users", label: "Users" },
] as const;
export type SearchType = (typeof SearchOptions)[number]["value"];

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
    SearchOptions.find((option) =>
      URL_TYPES[option.value].includes(urlType ?? ""),
    )?.value ?? "posts"
  );
}
