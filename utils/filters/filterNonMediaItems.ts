import { Post } from "../../api/Posts";
import { FilterFunction } from "../useRedditDataState";

export const filterNonMediaItems: FilterFunction<Post> = async (posts) => {
  return posts.filter(
    (post) => post.images.length > 0 || post.video !== undefined,
  );
};
