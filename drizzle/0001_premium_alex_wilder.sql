CREATE TABLE `agentActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`activityType` enum('lead_generation','lead_qualification','installer_outreach','lead_matching','system_optimization','data_analysis') NOT NULL,
	`description` text NOT NULL,
	`status` enum('success','partial','failed') NOT NULL,
	`leadsGenerated` int NOT NULL DEFAULT 0,
	`leadsQualified` int NOT NULL DEFAULT 0,
	`offersCreated` int NOT NULL DEFAULT 0,
	`metadata` text,
	`errorDetails` text,
	`startedAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agentActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`state` varchar(10) NOT NULL,
	`servicePostcodes` text NOT NULL,
	`serviceRadius` int NOT NULL DEFAULT 50,
	`address` text,
	`suburb` varchar(100),
	`postcode` varchar(10),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`abn` varchar(20),
	`website` varchar(500),
	`maxLeadsPerMonth` int NOT NULL DEFAULT 50,
	`maxLeadPrice` int NOT NULL DEFAULT 70,
	`autoAcceptLeads` boolean NOT NULL DEFAULT false,
	`stripeCustomerId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installers_id` PRIMARY KEY(`id`),
	CONSTRAINT `installers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `leadOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`installerId` int NOT NULL,
	`offerPrice` int NOT NULL,
	`distance` int,
	`status` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`emailSent` boolean NOT NULL DEFAULT false,
	`smsSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leadOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` enum('ai_generated','web_form','api','manual') NOT NULL DEFAULT 'ai_generated',
	`sourceDetails` text,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(50) NOT NULL,
	`address` text NOT NULL,
	`suburb` varchar(100) NOT NULL,
	`state` varchar(10) NOT NULL,
	`postcode` varchar(10) NOT NULL,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`propertyType` enum('residential','commercial','industrial') NOT NULL DEFAULT 'residential',
	`roofType` varchar(50),
	`estimatedSystemSize` int,
	`currentElectricityBill` int,
	`qualityScore` int NOT NULL DEFAULT 50,
	`status` enum('new','offered','accepted','sold','expired','invalid') NOT NULL DEFAULT 'new',
	`basePrice` int NOT NULL DEFAULT 50,
	`notes` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`installerId` int NOT NULL,
	`leadOfferId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'AUD',
	`stripePaymentIntentId` varchar(255),
	`stripeChargeId` varchar(255),
	`stripeInvoiceId` varchar(255),
	`status` enum('pending','processing','succeeded','failed','refunded') NOT NULL DEFAULT 'pending',
	`metadata` text,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
