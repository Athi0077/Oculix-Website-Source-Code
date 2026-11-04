CREATE TABLE `odyssey_certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`issued_at` text NOT NULL,
	`score` integer NOT NULL,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `odyssey_certificates_user_id_unique` ON `odyssey_certificates` (`user_id`);--> statement-breakpoint
CREATE TABLE `odyssey_enrolments` (
	`email` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`granted_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `odyssey_exams` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`question_ids` text NOT NULL,
	`expires_at` integer NOT NULL,
	`submitted_at` integer,
	`score` integer
);
--> statement-breakpoint
CREATE INDEX `odyssey_exams_user` ON `odyssey_exams` (`user_id`);--> statement-breakpoint
CREATE TABLE `odyssey_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`best_score` integer NOT NULL,
	`attempts` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `odyssey_progress_user` ON `odyssey_progress` (`user_id`);