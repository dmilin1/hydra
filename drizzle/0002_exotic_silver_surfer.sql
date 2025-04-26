CREATE TABLE `drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`text` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drafts_key_idx` ON `drafts` (`key`);--> statement-breakpoint
CREATE INDEX `drafts_createdAt_idx` ON `drafts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `drafts_updatedAt_idx` ON `drafts` (`updatedAt`);