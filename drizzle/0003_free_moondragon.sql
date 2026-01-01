CREATE TABLE `auctionBids` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`installerId` int NOT NULL,
	`bidAmount` int NOT NULL,
	`isWinningBid` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auctionBids_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bundlePurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installerId` int NOT NULL,
	`bundleType` enum('buy5get1','weekly10','monthly30') NOT NULL,
	`totalLeads` int NOT NULL,
	`originalPrice` int NOT NULL,
	`discountAmount` int NOT NULL,
	`finalPrice` int NOT NULL,
	`stripePaymentIntentId` varchar(255),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bundlePurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installerCertifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installerId` int NOT NULL,
	`certificationType` enum('basic','advanced','master') NOT NULL,
	`purchaseDate` timestamp NOT NULL DEFAULT (now()),
	`expiryDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`stripePaymentIntentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `installerCertifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leadClosures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`installerId` int NOT NULL,
	`transactionId` int NOT NULL,
	`closedDate` timestamp NOT NULL,
	`contractValue` int,
	`performanceBonus` int NOT NULL DEFAULT 4000,
	`bonusPaid` boolean NOT NULL DEFAULT false,
	`stripeBonusPaymentId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leadClosures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredInstallerId` int NOT NULL,
	`commissionAmount` int NOT NULL DEFAULT 5000,
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`stripePayoutId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`installerId` int NOT NULL,
	`stripeSubscriptionId` varchar(255) NOT NULL,
	`status` enum('active','cancelled','past_due') NOT NULL DEFAULT 'active',
	`monthlyFee` int NOT NULL DEFAULT 9900,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trainingSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whiteLabelClients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`industry` varchar(100) NOT NULL,
	`setupFee` int NOT NULL DEFAULT 500000,
	`monthlyLicense` int NOT NULL DEFAULT 99900,
	`revenueSharePercentage` int NOT NULL DEFAULT 10,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whiteLabelClients_id` PRIMARY KEY(`id`)
);
