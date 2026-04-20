ALTER TABLE `orders` ADD `shippingFee` decimal(10,2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `discountTier` varchar(32);