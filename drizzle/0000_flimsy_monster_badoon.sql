CREATE TABLE `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) NOT NULL UNIQUE,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  `lastSignedIn` timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE `vault_entries` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
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
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW()
);

CREATE TABLE `password_health_cache` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `vaultEntryId` int,
  `strengthScore` int DEFAULT 0,
  `isWeak` int DEFAULT 0,
  `isReused` int DEFAULT 0,
  `isOld` int DEFAULT 0,
  `recommendation` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW() ON UPDATE NOW()
);
