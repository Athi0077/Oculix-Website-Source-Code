CREATE TABLE `lab_exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`attempt` integer NOT NULL,
	`version` text NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`submitted_at` integer,
	`answers` text NOT NULL,
	`mcq_score` integer,
	`practical_score` integer,
	`criteria` text,
	`feedback` text DEFAULT '' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer
);
--> statement-breakpoint
CREATE INDEX `lab_exam_user` ON `lab_exam_attempts` (`user_id`);