import { PostDetail } from "./PostDetail";
import { Post } from "./Posts";
import { HYDRA_SERVER_URL } from "../constants/HydraServer";

export async function summarizePostDetails(
  customerId: string,
  post: PostDetail,
): Promise<string> {
  const response = await fetch(
    `${HYDRA_SERVER_URL}/api/ai/summarizePostDetails`,
    {
      method: "POST",
      body: JSON.stringify({
        customerId,
        subreddit: post.subreddit,
        postTitle: post.title,
        postAuthor: post.author,
        postText: post.text.slice(0, 15_000),
      }),
    },
  );
  return await response.text();
}

export async function summarizePostComments(
  customerId: string,
  post: PostDetail,
  postSummary: string,
): Promise<string> {
  const topComments = post.comments
    .slice(0, 5)
    .map((comment) => comment.text.slice(0, 3_000));
  const response = await fetch(`${HYDRA_SERVER_URL}/api/ai/summarizeComments`, {
    method: "POST",
    body: JSON.stringify({
      customerId,
      postTitle: post.title,
      postAuthor: post.author,
      postSummary,
      comments: topComments,
    }),
  });
  return await response.text();
}

export async function filterPosts(
  customerId: string,
  filterDescription: string,
  posts: Post[],
): Promise<Record<Post["id"], boolean>> {
  const response = await fetch(`${HYDRA_SERVER_URL}/api/ai/filterPosts`, {
    method: "POST",
    body: JSON.stringify({
      customerId,
      filterDescription,
      posts: posts.map((p) => ({
        id: p.id,
        subreddit: p.subreddit,
        title: p.title,
        text: p.text.slice(0, 500),
      })),
    }),
  });
  return await response.json();
}
