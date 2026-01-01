ALTER TABLE `leads` ADD `finalPrice` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `isResold` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `originalSaleDate` timestamp;--> statement-breakpoint
ALTER TABLE `leads` ADD `resaleCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `leadType` enum('standard','commercial','battery_storage') DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `enrichmentLevel` enum('none','basic','premium') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `enrichmentData` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `isAuctionLead` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `auctionStartPrice` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `auctionEndTime` timestamp;