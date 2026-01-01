CREATE TABLE `conversionEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installerId` int NOT NULL,
	`leadId` int NOT NULL,
	`purchaseDate` timestamp NOT NULL,
	`conversionDate` timestamp,
	`hoursToClose` int,
	`dealValue` int NOT NULL,
	`systemSize` int,
	`includesBattery` boolean NOT NULL DEFAULT false,
	`leadQualityScore` int NOT NULL,
	`customerRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversionEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installerMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installerId` int NOT NULL,
	`totalLeadsPurchased` int NOT NULL DEFAULT 0,
	`totalLeadsConverted` int NOT NULL DEFAULT 0,
	`conversionRate` int NOT NULL DEFAULT 0,
	`totalSpent` int NOT NULL DEFAULT 0,
	`totalRevenue` int NOT NULL DEFAULT 0,
	`averageDealSize` int NOT NULL DEFAULT 0,
	`roi` int NOT NULL DEFAULT 0,
	`averageTimeToClose` int NOT NULL DEFAULT 0,
	`fastestClose` int NOT NULL DEFAULT 0,
	`averageLeadQuality` int NOT NULL DEFAULT 0,
	`customerSatisfaction` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT false,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installerMetrics_id` PRIMARY KEY(`id`)
);
