CREATE TABLE `phone_verifications` (
	`id` varchar(64) NOT NULL,
	`phone_number` varchar(20) NOT NULL,
	`code` varchar(10) NOT NULL,
	`lead_id` int,
	`verified` boolean NOT NULL DEFAULT false,
	`verified_at` timestamp,
	`attempts` int NOT NULL DEFAULT 0,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `phone_verifications_id` PRIMARY KEY(`id`)
);
