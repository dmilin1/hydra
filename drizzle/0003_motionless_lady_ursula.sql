CREATE TABLE `custom_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_themes_name_idx` ON `custom_themes` (`name`);--> statement-breakpoint
CREATE INDEX `custom_themes_createdAt_idx` ON `custom_themes` (`createdAt`);--> statement-breakpoint
CREATE INDEX `custom_themes_updatedAt_idx` ON `custom_themes` (`updatedAt`);