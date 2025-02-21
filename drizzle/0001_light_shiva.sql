CREATE UNIQUE INDEX `postId_idx` ON `seen_posts` (`postId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `seen_posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `updatedAt_idx` ON `seen_posts` (`updatedAt`);