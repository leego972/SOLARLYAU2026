CREATE TABLE `adBudgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`month` timestamp NOT NULL,
	`amount` int NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedBy` int,
	`approvedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adBudgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`googleCampaignId` varchar(255),
	`name` varchar(255) NOT NULL,
	`status` enum('active','paused','ended') NOT NULL DEFAULT 'active',
	`dailyBudget` int NOT NULL,
	`monthlyBudget` int NOT NULL,
	`targetCostPerLead` int NOT NULL DEFAULT 20,
	`keywords` text NOT NULL,
	`adCopy` text NOT NULL,
	`locations` text NOT NULL,
	`totalSpent` int NOT NULL DEFAULT 0,
	`totalClicks` int NOT NULL DEFAULT 0,
	`totalImpressions` int NOT NULL DEFAULT 0,
	`totalConversions` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adPerformance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`date` timestamp NOT NULL,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`cost` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`ctr` int NOT NULL DEFAULT 0,
	`cpc` int NOT NULL DEFAULT 0,
	`costPerConversion` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adPerformance_id` PRIMARY KEY(`id`)
);
