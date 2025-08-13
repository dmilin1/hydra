import { sql } from "drizzle-orm";
import {
  integer,
  sqliteTable,
  text,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const SeenPosts = sqliteTable(
  "seen_posts",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: text().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("postId_idx").on(table.postId),
    index("createdAt_idx").on(table.createdAt),
    index("updatedAt_idx").on(table.updatedAt),
  ],
);

export const Drafts = sqliteTable(
  "drafts",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    key: text().notNull(),
    text: text().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("drafts_key_idx").on(table.key),
    index("drafts_createdAt_idx").on(table.createdAt),
    index("drafts_updatedAt_idx").on(table.updatedAt),
  ],
);

export const CustomThemes = sqliteTable(
  "custom_themes",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    data: text().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("custom_themes_name_idx").on(table.name),
    index("custom_themes_createdAt_idx").on(table.createdAt),
    index("custom_themes_updatedAt_idx").on(table.updatedAt),
  ],
);

export const CounterStats = sqliteTable(
  "counter_stats",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    key: text().notNull(),
    count: integer({ mode: "number" }).notNull().default(0),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("counter_stats_key_idx").on(table.key),
    index("counter_stats_createdAt_idx").on(table.createdAt),
    index("counter_stats_updatedAt_idx").on(table.updatedAt),
  ],
);

export const SubredditVisits = sqliteTable(
  "subreddit_visits",
  {
    id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    subreddit: text().notNull(),
    count: integer({ mode: "number" }).notNull().default(1),
    createdAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text()
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [
    uniqueIndex("subreddit_visits_subreddit_idx").on(table.subreddit),
    index("subreddit_visits_createdAt_idx").on(table.createdAt),
    index("subreddit_visits_updatedAt_idx").on(table.updatedAt),
  ],
);
