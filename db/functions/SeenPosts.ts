import { eq, inArray, lt } from "drizzle-orm";

import db from "..";
import { Post } from "../../api/Posts";
import { SeenPosts } from "../schema";

export async function maintainSeenPosts() {
  const MAX_SEEN_POSTS = 5_000;
  const seenPostCount = await db.$count(SeenPosts);
  if (seenPostCount > MAX_SEEN_POSTS) {
    const oldestSeenPost = db
      .select()
      .from(SeenPosts)
      .orderBy(SeenPosts.createdAt)
      .offset(seenPostCount - MAX_SEEN_POSTS)
      .limit(1)
      .get();
    if (oldestSeenPost) {
      await db.delete(SeenPosts).where(lt(SeenPosts.id, oldestSeenPost.id));
    }
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

export function isPostSeen(post: Post): boolean {
  const result = db
    .select()
    .from(SeenPosts)
    .where(eq(SeenPosts.postId, post.id))
    .limit(1)
    .get();
  return !!result;
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
