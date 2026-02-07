import { PostDetail } from "./PostDetail";
import { Post } from "./Posts";
import {
  DEFAULT_HYDRA_SERVER_URL,
  HYDRA_SERVER_URL,
} from "../constants/HydraServer";

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

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `${DEFAULT_HYDRA_SERVER_URL}/api/ai/createEmbedding`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
  return await response.json();
}

export async function askQuestion(
  question: string,
  docs: string[],
): Promise<{ markdown: string }> {
  const response = await fetch(`${HYDRA_SERVER_URL}/api/ai/askQuestion`, {
    method: "POST",
    body: JSON.stringify({ question, docs }),
  });
  return await response.json();
}
