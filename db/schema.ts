import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex, } from "drizzle-orm/sqlite-core";


export const SeenPosts = sqliteTable("seen_posts", {
    id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
    postId: text().notNull(),
    createdAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text().notNull().default(sql`(CURRENT_TIMESTAMP)`).$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
}, (table) => [
    uniqueIndex('postId_idx').on(table.postId),
]);