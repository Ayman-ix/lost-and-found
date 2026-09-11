-- ==========================================================
-- LOST & FOUND NETWORK - RELATIONAL DATABASE MANAGEMENT SYSTEM
-- Target Engine: MySQL 8.0+
-- Description: Complete Relational Schema (DDL) with Foreign
--              Keys, Constraints, Indexes, and Initial Seed Data.
-- ==========================================================

CREATE DATABASE IF NOT EXISTS lost_and_found_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lost_and_found_db;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(25) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_email (`email`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. ADMINS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_email (`email`)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. LOCATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `location` (
  `location_id` INT AUTO_INCREMENT PRIMARY KEY,
  `location_name` VARCHAR(150) NOT NULL,
  `city` VARCHAR(100) DEFAULT 'Campus',
  `address` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. LOST ITEMS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lost_item` (
  `lost_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `date_lost` DATE NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Lost',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lost_user (`user_id`),
  INDEX idx_lost_category (`category_id`),
  INDEX idx_lost_location (`location_id`),
  INDEX idx_lost_status (`status`),
  CONSTRAINT fk_lost_user FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT fk_lost_category FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT fk_lost_location FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. FOUND ITEMS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `found_item` (
  `found_item_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `date_found` DATE NOT NULL,
  `storage_location` VARCHAR(200) DEFAULT 'Campus Lost & Found Office',
  `status` VARCHAR(50) NOT NULL DEFAULT 'Found',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_found_user (`user_id`),
  INDEX idx_found_category (`category_id`),
  INDEX idx_found_location (`location_id`),
  INDEX idx_found_status (`status`),
  CONSTRAINT fk_found_user FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT fk_found_category FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE RESTRICT,
  CONSTRAINT fk_found_location FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. ITEM IMAGES TABLE (1:N with Lost and Found Items)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `item_image` (
  `image_id` INT AUTO_INCREMENT PRIMARY KEY,
  `lost_item_id` INT DEFAULT NULL,
  `found_item_id` INT DEFAULT NULL,
  `image_url` TEXT NOT NULL,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_img_lost (`lost_item_id`),
  INDEX idx_img_found (`found_item_id`),
  CONSTRAINT fk_img_lost FOREIGN KEY (`lost_item_id`) REFERENCES `lost_item` (`lost_item_id`) ON DELETE CASCADE,
  CONSTRAINT fk_img_found FOREIGN KEY (`found_item_id`) REFERENCES `found_item` (`found_item_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. CLAIMS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `claim` (
  `claim_id` INT AUTO_INCREMENT PRIMARY KEY,
  `found_item_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `proof` TEXT NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `claim_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_claim_found (`found_item_id`),
  INDEX idx_claim_user (`user_id`),
  INDEX idx_claim_status (`status`),
  CONSTRAINT fk_claim_found FOREIGN KEY (`found_item_id`) REFERENCES `found_item` (`found_item_id`) ON DELETE CASCADE,
  CONSTRAINT fk_claim_user FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. POTENTIAL MATCHES TABLE (M:N Match Analysis)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `potential_match` (
  `match_id` INT AUTO_INCREMENT PRIMARY KEY,
  `lost_item_id` INT NOT NULL,
  `found_item_id` INT NOT NULL,
  `match_score` DECIMAL(5,2) NOT NULL,
  `match_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_lost_found_match (`lost_item_id`, `found_item_id`),
  INDEX idx_match_score (`match_score`),
  CONSTRAINT fk_match_lost FOREIGN KEY (`lost_item_id`) REFERENCES `lost_item` (`lost_item_id`) ON DELETE CASCADE,
  CONSTRAINT fk_match_found FOREIGN KEY (`found_item_id`) REFERENCES `found_item` (`found_item_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 10. VERIFICATIONS TABLE (Admin verification audit)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `verification` (
  `verification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `claim_id` INT NOT NULL UNIQUE,
  `admin_id` INT NOT NULL,
  `verification_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `remarks` TEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Approved',
  INDEX idx_verif_claim (`claim_id`),
  INDEX idx_verif_admin (`admin_id`),
  CONSTRAINT fk_verif_claim FOREIGN KEY (`claim_id`) REFERENCES `claim` (`claim_id`) ON DELETE CASCADE,
  CONSTRAINT fk_verif_admin FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 11. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification` (
  `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('Unread', 'Read') DEFAULT 'Unread',
  `notification_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (`user_id`),
  INDEX idx_notif_status (`status`),
  CONSTRAINT fk_notif_user FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Categories
INSERT INTO `category` (`category_id`, `category_name`, `description`) VALUES
(1, 'Electronics', 'Phones, laptops, chargers, headphones, smartwatches, calculators'),
(2, 'Wallets & Bags', 'Backpacks, purses, handbags, wallets, tote bags'),
(3, 'Keys & Access Cards', 'Dorm keys, car keys, RFID badges, keychains'),
(4, 'Documents & IDs', 'Student IDs, driver licenses, passports, notebooks, binders'),
(5, 'Clothing & Accessories', 'Jackets, hoodies, caps, umbrellas, sunglasses, scarves'),
(6, 'Jewellery & Watches', 'Rings, necklaces, analog watches, bracelets'),
(7, 'Books & Stationary', 'Textbooks, pencil cases, scientific calculators'),
(8, 'Other', 'Water bottles, sports gear, musical instruments')
ON DUPLICATE KEY UPDATE `category_name` = VALUES(`category_name`);

-- Locations
INSERT INTO `location` (`location_id`, `location_name`, `city`, `address`) VALUES
(1, 'Central Campus Library', 'Main Campus', 'Building A, 1st & 2nd Floor Study Commons'),
(2, 'Student Activities Center', 'Main Campus', 'West Wing, Food Court & Lounge'),
(3, 'Science & Engineering Complex', 'North Campus', 'Block C, Laboratories & Lecture Halls'),
(4, 'Sports Gymnasium & Arena', 'South Campus', 'Court 1 & Locker Room Entry'),
(5, 'Campus Cafeteria & Dining Hall', 'Central Hub', 'Main Dining Area & Patio'),
(6, 'North Student Residence Hall', 'Residential Quad', 'Lobby & Common Room'),
(7, 'University Health Center', 'Main Campus', 'Reception & Waiting Lounge'),
(8, 'Administration Building', 'Main Campus', 'Ground Floor Information Desk')
ON DUPLICATE KEY UPDATE `location_name` = VALUES(`location_name`);

-- Default Admin User (Password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO `admin` (`admin_id`, `name`, `email`, `password`) VALUES
(1, 'Campus Administrator', 'admin@campus.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
