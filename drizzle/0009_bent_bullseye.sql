CREATE TABLE `lead_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`eventType` enum('submitted','verified','matched','installer_notified','installer_viewed','installer_responded','quote_received','installation_scheduled','installation_completed','review_requested') NOT NULL,
	`description` text,
	`installerId` int,
	`installerName` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rating_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`leadId` int NOT NULL,
	`installerId` int NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`usedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rating_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `rating_tokens_token_unique` UNIQUE(`token`)
);
