CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`path` text NOT NULL,
	`day` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `visits_day_session` ON `visits` (`day`,`session_id`);--> statement-breakpoint
CREATE INDEX `visits_session` ON `visits` (`session_id`);