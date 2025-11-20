-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 18, 2025 at 06:06 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gym_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `product_id` int NOT NULL,
  `product_type` enum('clothing','equipment','training') NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `product_image` varchar(500) DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size` varchar(10) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_product` (`product_id`,`product_type`),
  KEY `idx_cart_session_product` (`session_id`,`product_id`,`product_type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `session_id`, `product_id`, `product_type`, `product_name`, `product_price`, `product_image`, `quantity`, `size`, `color`, `created_at`, `updated_at`) VALUES
(1, 'test_session_123', 1, 'clothing', 'Premium Hoodie', 4500.00, 'IMG/clo1.webp', 2, 'L', 'Black', '2025-11-18 06:06:09', '2025-11-18 06:06:09'),
(2, 'test_session_123', 2, 'equipment', 'Adjustable Dumbbells', 8900.00, 'IMG/iteam1.jpg', 1, NULL, NULL, '2025-11-18 06:06:09', '2025-11-18 06:06:09');

-- --------------------------------------------------------

--
-- Table structure for table `clothing_products`
--

DROP TABLE IF EXISTS `clothing_products`;
CREATE TABLE IF NOT EXISTS `clothing_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image` text,
  `description` text,
  `sizes` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image1` varchar(255) DEFAULT NULL,
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL,
  `image4` varchar(255) DEFAULT NULL,
  `image5` varchar(255) DEFAULT NULL,
  `image6` varchar(255) DEFAULT NULL,
  `colors` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clothing_products`
--

INSERT INTO `clothing_products` (`id`, `name`, `category`, `price`, `stock`, `image`, `description`, `sizes`, `status`, `created_at`, `image1`, `image2`, `image3`, `image4`, `image5`, `image6`, `colors`) VALUES
(8, 'Premium Hoodie Pro', 'hoodie', 250.00, 0, 'uploads/products/product_691aa94f8c860_1763354959.webp', 'well maid', 'S,M,XL,XXL,L', 'new', '2025-11-17 04:49:19', 'uploads/products/product_691aa94f8c860_1763354959.webp', 'uploads/products/product_691aa94f8f85a_1763354959.webp', 'uploads/products/product_691aa94f93bd1_1763354959.webp', 'uploads/products/product_691aa94f9970b_1763354959.webp', 'uploads/products/product_691aa94f9d1f3_1763354959.webp', 'uploads/products/product_691aa94fa0dcc_1763354959.webp', 'Black,White');

-- --------------------------------------------------------

--
-- Stand-in structure for view `clothing_products_with_stock`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `clothing_products_with_stock`;
CREATE TABLE IF NOT EXISTS `clothing_products_with_stock` (
`category` varchar(100)
,`colors` varchar(255)
,`created_at` timestamp
,`description` text
,`id` int
,`image` text
,`image1` varchar(255)
,`image2` varchar(255)
,`image3` varchar(255)
,`image4` varchar(255)
,`image5` varchar(255)
,`image6` varchar(255)
,`name` varchar(255)
,`price` decimal(10,2)
,`size_stock_info` text
,`sizes` varchar(255)
,`status` varchar(50)
,`stock` int
,`total_stock` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `clothing_stock`
--

DROP TABLE IF EXISTS `clothing_stock`;
CREATE TABLE IF NOT EXISTS `clothing_stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `size` varchar(10) NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_size` (`product_id`,`size`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clothing_stock`
--

INSERT INTO `clothing_stock` (`id`, `product_id`, `size`, `stock_quantity`, `created_at`, `updated_at`) VALUES
(24, 8, 'S', 2, '2025-11-17 04:49:19', '2025-11-17 04:49:19'),
(25, 8, 'M', 8, '2025-11-17 04:49:19', '2025-11-17 04:49:19'),
(26, 8, 'L', 10, '2025-11-17 04:49:19', '2025-11-17 04:49:19'),
(27, 8, 'XL', 10, '2025-11-17 04:49:19', '2025-11-17 04:49:19'),
(28, 8, 'XXL', 10, '2025-11-17 04:49:19', '2025-11-17 04:49:19');

-- --------------------------------------------------------

--
-- Table structure for table `equipment_products`
--

DROP TABLE IF EXISTS `equipment_products`;
CREATE TABLE IF NOT EXISTS `equipment_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `image` text,
  `description` text,
  `material` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `image1` varchar(255) DEFAULT NULL,
  `image2` varchar(255) DEFAULT NULL,
  `image3` varchar(255) DEFAULT NULL,
  `image4` varchar(255) DEFAULT NULL,
  `image5` varchar(255) DEFAULT NULL,
  `image6` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `equipment_products`
--

INSERT INTO `equipment_products` (`id`, `name`, `category`, `price`, `stock`, `image`, `description`, `material`, `status`, `created_at`, `image1`, `image2`, `image3`, `image4`, `image5`, `image6`) VALUES
(1, 'Adjustable Dumbbells', 'dumbbell', 89.99, 15, 'IMG/iteam1.jpg', 'Professional adjustable dumbbells ranging from 5-50lbs. Perfect for home gym setups.', 'Steel', 'new', '2025-11-14 15:56:56', 'IMG/iteam1.jpg', NULL, NULL, NULL, NULL, NULL),
(2, 'Exercise Mat Premium', 'mat', 34.99, 25, 'IMG/iteam2.jpg', 'Non-slip exercise mat with 6mm thickness for maximum comfort during workouts.', 'NBR Foam', 'normal', '2025-11-14 15:56:56', 'IMG/iteam2.jpg', NULL, NULL, NULL, NULL, NULL),
(3, 'Resistance Bands Set', 'resistance', 19.99, 40, 'IMG/iteam3.jpg', 'Complete resistance bands set with handles, door anchor, and exercise guide.', 'Latex', 'sale', '2025-11-14 15:56:56', 'IMG/iteam3.jpg', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `idx_orders_date` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_type` varchar(50) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training_sessions`
--

DROP TABLE IF EXISTS `training_sessions`;
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `trainer` varchar(255) NOT NULL,
  `duration` int NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `capacity` int NOT NULL,
  `enrolled` int DEFAULT '0',
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `created_at`, `profile_image`) VALUES
(1, 'Chenuka ', 'chenukawork@gmail.com', '$2y$10$NKgE.Ob80qf7khzms5Ak3OD2hpSQ/VInkxFVhfES4.lQwId9tF.sO', '2025-11-07 12:57:40', 'Chenuka _1762609583.png');

-- --------------------------------------------------------

--
-- Structure for view `clothing_products_with_stock`
--
DROP TABLE IF EXISTS `clothing_products_with_stock`;

DROP VIEW IF EXISTS `clothing_products_with_stock`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `clothing_products_with_stock`  AS SELECT `cp`.`id` AS `id`, `cp`.`name` AS `name`, `cp`.`category` AS `category`, `cp`.`price` AS `price`, `cp`.`stock` AS `stock`, `cp`.`image` AS `image`, `cp`.`description` AS `description`, `cp`.`sizes` AS `sizes`, `cp`.`status` AS `status`, `cp`.`created_at` AS `created_at`, `cp`.`image1` AS `image1`, `cp`.`image2` AS `image2`, `cp`.`image3` AS `image3`, `cp`.`image4` AS `image4`, `cp`.`image5` AS `image5`, `cp`.`image6` AS `image6`, `cp`.`colors` AS `colors`, coalesce(sum(`cs`.`stock_quantity`),0) AS `total_stock`, group_concat(concat(`cs`.`size`,':',`cs`.`stock_quantity`) order by field(`cs`.`size`,'XS','S','M','L','XL','XXL','XXXL') ASC separator ',') AS `size_stock_info` FROM (`clothing_products` `cp` left join `clothing_stock` `cs` on((`cp`.`id` = `cs`.`product_id`))) GROUP BY `cp`.`id` ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
