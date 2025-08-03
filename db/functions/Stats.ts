import { AppState } from "react-native";
import db from "..";
import { CounterStats, SubredditVisits } from "../schema";
import { eq, sql } from "drizzle-orm";

export enum Stat {
  APP_LAUNCHES = "app_launches",
  APP_FOREGROUNDS = "app_foregrounds",
  SCROLL_DISTANCE = "scroll_distance",
  POSTS_VIEWED = "posts_viewed",
  POST_UPVOTES = "post_upvotes",
  POST_DOWNVOTES = "post_downvotes",
  POSTS_CREATED = "posts_created",
  COMMENT_UPVOTES = "comment_upvotes",
  COMMENT_DOWNVOTES = "comment_downvotes",
  COMMENTS_CREATED = "comments_created",
}

export function getStat(key: Stat): number | null {
  const stat = db
    .select()
    .from(CounterStats)
    .where(eq(CounterStats.key, key))
    .get();
  return stat?.count ?? 0;
}

export function getStats(): Record<Stat, number> {
  const stats = db.select().from(CounterStats).all();
  return stats.reduce(
    (acc, stat) => {
      acc[stat.key as Stat] = stat.count ?? 0;
      return acc;
    },
    {} as Record<Stat, number>,
  );
}

export function resetStats() {
  return db.delete(CounterStats).execute();
}

export function modifyStat(key: Stat, delta: number) {
  return db
    .insert(CounterStats)
    .values({
      key,
      count: delta,
    })
    .onConflictDoUpdate({
      target: CounterStats.key,
      set: {
        count: sql`${CounterStats.count} + ${delta}`,
      },
    })
    .execute();
}

export function getSubredditVisitCounts(): Record<string, number> {
  const stats = db.select().from(SubredditVisits).all();
  return stats.reduce(
    (acc, stat) => {
      acc[stat.subreddit] = stat.count ?? 0;
      return acc;
    },
    {} as Record<string, number>,
  );
}

export function incrementSubredditVisitCount(subreddit: string) {
  return db
    .insert(SubredditVisits)
    .values({
      subreddit,
    })
    .onConflictDoUpdate({
      target: SubredditVisits.subreddit,
      set: {
        count: sql`${SubredditVisits.count} + 1`,
      },
    })
    .execute();
}

modifyStat(Stat.APP_LAUNCHES, 1);
modifyStat(Stat.APP_FOREGROUNDS, 1);
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    modifyStat(Stat.APP_FOREGROUNDS, 1);
  }
});
