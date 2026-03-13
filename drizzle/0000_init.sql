CREATE TABLE IF NOT EXISTS `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `users_name_unique` ON `users` (`name`);
CREATE TABLE IF NOT EXISTS `requests` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `client_name` text NOT NULL,
  `phone` text NOT NULL,
  `address` text NOT NULL,
  `problem_text` text NOT NULL,
  `status` text DEFAULT 'new' NOT NULL,
  `assigned_to` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
