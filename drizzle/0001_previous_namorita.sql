CREATE TABLE `password_health_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vaultEntryId` int,
	`strengthScore` int DEFAULT 0,
	`isWeak` int DEFAULT 0,
	`isReused` int DEFAULT 0,
	`isOld` int DEFAULT 0,
	`recommendation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `password_health_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vault_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`website` varchar(500),
	`username` varchar(255),
	`email` varchar(320),
	`encryptedPassword` text NOT NULL,
	`notes` text,
	`category` varchar(100) DEFAULT 'Personal',
	`tags` text,
	`favorite` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vault_entries_id` PRIMARY KEY(`id`)
);
