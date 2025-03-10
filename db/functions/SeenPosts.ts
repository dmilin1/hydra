import { eq, inArray, lt } from "drizzle-orm";

import db from "..";
import { Post } from "../../api/Posts";
import { SeenPosts } from "../schema";

export async function maintainSeenPosts() {
  const MAX_SEEN_POSTS = 5_000;
  const seenPostCount = await db.$count(SeenPosts);
  if (seenPostCount > MAX_SEEN_POSTS) {
    const oldestSeenPost = await db
      .select()
      .from(SeenPosts)
      .orderBy(SeenPosts.createdAt)
      .offset(seenPostCount - MAX_SEEN_POSTS)
      .limit(1);
    await db.delete(SeenPosts).where(lt(SeenPosts.id, oldestSeenPost[0].id));
  }
}

export async function markPostSeen(post: Post) {
  await db
    .insert(SeenPosts)
    .values({
      postId: post.id,
    })
    .onConflictDoNothing();
}

export async function markPostUnseen(post: Post) {
  await db.delete(SeenPosts).where(eq(SeenPosts.postId, post.id));
}

export async function isPostSeen(post: Post): Promise<boolean> {
  const result = await db
    .select()
    .from(SeenPosts)
    .where(eq(SeenPosts.postId, post.id))
    .limit(1);
  return result.length > 0;
}

export async function arePostsSeen(posts: Post[]): Promise<boolean[]> {
  const seenPosts = await db
    .select()
    .from(SeenPosts)
    .where(
      inArray(
        SeenPosts.postId,
        posts.map((post) => post.id),
      ),
    );
  return posts.map((post) =>
    seenPosts.some((seenPost) => seenPost.postId === post.id),
  );
}
