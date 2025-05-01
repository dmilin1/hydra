import { PostDetail, Comment } from "./PostDetail";
import { Post } from "./Posts";
import { api } from "./RedditApi";

export async function saveItem(
  item: Post | PostDetail | Comment,
  saved: boolean,
): Promise<void> {
  await api(
    `https://www.reddit.com/api/${saved ? "save" : "unsave"}`,
    {
      method: "POST",
    },
    {
      requireAuth: true,
      body: {
        id: item.name,
      },
    },
  );
}
