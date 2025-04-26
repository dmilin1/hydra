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
