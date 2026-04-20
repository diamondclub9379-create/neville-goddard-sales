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
