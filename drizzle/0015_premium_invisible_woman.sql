CREATE TABLE `blogPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`imageUrl` text,
	`category` varchar(100),
	`author` varchar(100),
	`isPublished` int NOT NULL DEFAULT 1,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`publishedAt` timestamp,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `bookReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`reviewerName` varchar(100) NOT NULL,
	`rating` int NOT NULL,
	`content` text NOT NULL,
	`isVerified` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleTh` varchar(255) NOT NULL,
	`titleEn` varchar(255),
	`slug` varchar(255) NOT NULL,
	`description` text,
	`descriptionTh` text,
	`price` decimal(10,2) NOT NULL,
	`discountPrice` decimal(10,2),
	`imageUrl` text NOT NULL,
	`purchaseLink` text,
	`category` varchar(100),
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `stripePaymentIntentId` varchar(128);