CREATE TABLE `freeEbooks` (
`id` int AUTO_INCREMENT NOT NULL,
`titleTh` varchar(255) NOT NULL,
`titleEn` varchar(255),
`slug` varchar(255) NOT NULL,
`description` text,
`descriptionTh` text,
`imageUrl` text NOT NULL,
`fileUrl` text NOT NULL,
`category` varchar(100),
`downloadCount` int NOT NULL DEFAULT 0,
`isActive` int NOT NULL DEFAULT 1,
`createdAt` timestamp NOT NULL DEFAULT (now()),
`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
CONSTRAINT `freeEbooks_id` PRIMARY KEY(`id`),
CONSTRAINT `freeEbooks_slug_unique` UNIQUE(`slug`)
);
