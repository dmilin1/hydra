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
