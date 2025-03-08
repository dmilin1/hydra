import { Post } from "../../api/Posts";
import {
  FILTER_SEEN_POSTS_DEFAULT,
  FILTER_SEEN_POSTS_KEY,
} from "../../contexts/SettingsContexts/FiltersContext";
import { arePostsSeen } from "../../db/functions/SeenPosts";
import KeyStore from "../KeyStore";
import { FilterFunction } from "../useRedditDataState";

export const filterSeenItems: FilterFunction<Post> = async (posts) => {
  const shouldFilter =
    KeyStore.getBoolean(FILTER_SEEN_POSTS_KEY) ?? FILTER_SEEN_POSTS_DEFAULT;
  if (!shouldFilter) return posts;

  const seenPosts = await arePostsSeen(posts);
  return posts.filter((_post, index) => !seenPosts[index]);
};
