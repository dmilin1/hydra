import { defineOperation, gql } from "./GqlApi";
import { modifyStat, Stat } from "../../db/functions/Stats";

export class CaptchaError extends Error {}

const CreateSubredditPost = defineOperation(
  "CreateSubredditPost",
  "637a0679b68fc92f3372181ea344ce3ce29cd95bccd2e65f9cad8fb08ddafdd2",
);

function randomId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

type OperationError = { message?: string; code?: string; field?: string };

/**
 * Submits a post. `content` is the markdown body for "self" posts, and the
 * URL for "link" posts and "image" posts (from uploadImage() in ./Media).
 * Returns the new post's URL.
 *
 * Throws CaptchaError when Reddit asks for a captcha, and an error with
 * Reddit's message when it rejects the post.
 */
export async function submitPost(
  subreddit: string,
  kind: "self" | "link" | "image",
  title: string,
  content: string,
  flairId?: string,
  sendReplies = true,
): Promise<string> {
  const data = await gql(CreateSubredditPost, {
    input: {
      subredditName: subreddit,
      title,
      isSpoiler: false,
      isNsfw: false,
      isSendReplies: sendReplies,
      isResubmit: true,
      isCommercialCommunication: false,
      isClubContent: false,
      postSet: {},
      correlationId: randomId(),
      ...(flairId ? { flair: { templateId: flairId } } : {}),
      ...(kind === "self"
        ? { content: { markdown: content } }
        : kind === "link"
          ? { link: { url: content } }
          : { image: { url: content } }),
    },
  });
  const result = data.createSubredditPost;
  const errors: OperationError[] = [
    ...(result?.fieldErrors ?? []),
    ...(result?.errors ?? []),
  ];
  if (
    errors.some((error) =>
      `${error.code} ${error.field} ${error.message}`
        .toLowerCase()
        .includes("captcha"),
    )
  ) {
    throw new CaptchaError("Invalid captcha");
  }
  const message = errors.find((error) => error.message)?.message;
  if (message) {
    throw new Error(message);
  }
  const post = result?.post;
  if (!result?.ok || !post?.id) {
    throw new Error("Unknown error when submitting post");
  }
  modifyStat(Stat.POSTS_CREATED, 1);
  // post.url is a placeholder (https://www.reddit.com/self) for text posts.
  const postSubreddit = post.subreddit?.name ?? subreddit;
  return `https://www.reddit.com/r/${postSubreddit}/comments/${post.id.replace(/^t3_/, "")}/`;
}
