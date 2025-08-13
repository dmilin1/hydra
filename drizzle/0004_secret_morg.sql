CREATE TABLE `counter_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `counter_stats_key_idx` ON `counter_stats` (`key`);--> statement-breakpoint
CREATE INDEX `counter_stats_createdAt_idx` ON `counter_stats` (`createdAt`);--> statement-breakpoint
CREATE INDEX `counter_stats_updatedAt_idx` ON `counter_stats` (`updatedAt`);--> statement-breakpoint
CREATE TABLE `subreddit_visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subreddit` text NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subreddit_visits_subreddit_idx` ON `subreddit_visits` (`subreddit`);--> statement-breakpoint
CREATE INDEX `subreddit_visits_createdAt_idx` ON `subreddit_visits` (`createdAt`);--> statement-breakpoint
CREATE INDEX `subreddit_visits_updatedAt_idx` ON `subreddit_visits` (`updatedAt`);