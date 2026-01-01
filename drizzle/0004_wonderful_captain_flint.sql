CREATE TABLE `emailLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(100) NOT NULL DEFAULT 'popup',
	`guideDownloaded` boolean NOT NULL DEFAULT false,
	`convertedToInstaller` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emailLeads_id` PRIMARY KEY(`id`)
);
