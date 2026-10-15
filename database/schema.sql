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

-- Default Campus Administrator (Password: AdminSecure2026!)
-- bcrypt hash for 'AdminSecure2026!' (Cost: 10)
INSERT INTO `admin` (`admin_id`, `name`, `email`, `password`) VALUES
(1, 'Campus Administrator', 'admin@campus.edu', '$2b$10$kRCY/Y/Mp.vs.l0FN/Jgl.Sj3vN/sX3mCghcpawAMhX9bBChX8DoC')
ON DUPLICATE KEY UPDATE `password` = VALUES(`password`), `name` = VALUES(`name`);


-- ==========================================================
-- 12. DATABASE VIEWS (DATA ABSTRACTION & SECURITY)
-- ==========================================================

-- View 1: Active Lost Items Directory (Hides sensitive user credentials)
CREATE OR REPLACE VIEW v_active_lost_items AS
SELECT 
    l.lost_item_id,
    l.item_name,
    c.category_name,
    loc.location_name,
    loc.city AS campus_zone,
    u.name AS reported_by,
    u.email AS contact_email,
    l.brand,
    l.color,
    l.date_lost,
    l.status,
    l.created_at
FROM lost_item l
JOIN `user` u ON l.user_id = u.user_id
JOIN `category` c ON l.category_id = c.category_id
JOIN `location` loc ON l.location_id = loc.location_id
WHERE l.status IN ('Lost', 'Matched');

-- View 2: Active Found Items Directory (Available for Claiming)
CREATE OR REPLACE VIEW v_active_found_items AS
SELECT 
    f.found_item_id,
    f.item_name,
    c.category_name,
    loc.location_name AS found_location,
    f.storage_location,
    u.name AS handed_in_by,
    f.brand,
    f.color,
    f.date_found,
    f.status,
    f.created_at
FROM found_item f
JOIN `user` u ON f.user_id = u.user_id
JOIN `category` c ON f.category_id = c.category_id
JOIN `location` loc ON f.location_id = loc.location_id
WHERE f.status = 'Found';

-- View 3: Claims & Verification Management Dashboard
CREATE OR REPLACE VIEW v_claims_dashboard AS
SELECT 
    cl.claim_id,
    f.found_item_id,
    f.item_name AS item_claimed,
    c.category_name,
    cl.user_id AS claimant_id,
    u.name AS claimant_name,
    u.email AS claimant_email,
    cl.proof AS submitted_proof,
    cl.status AS claim_status,
    cl.claim_date,
    v.verification_id,
    v.status AS admin_decision,
    v.remarks AS admin_remarks,
    a.name AS verified_by
FROM claim cl
JOIN found_item f ON cl.found_item_id = f.found_item_id
JOIN category c ON f.category_id = c.category_id
JOIN `user` u ON cl.user_id = u.user_id
LEFT JOIN verification v ON cl.claim_id = v.claim_id
LEFT JOIN admin a ON v.admin_id = a.admin_id;

-- View 4: Campus Hotspot Analytics (Geographical Loss Distribution)
CREATE OR REPLACE VIEW v_campus_hotspots AS
SELECT 
    loc.location_id,
    loc.location_name,
    loc.city AS campus_zone,
    COUNT(DISTINCT l.lost_item_id) AS total_lost_reports,
    COUNT(DISTINCT f.found_item_id) AS total_found_reports
FROM location loc
LEFT JOIN lost_item l ON loc.location_id = l.location_id
LEFT JOIN found_item f ON loc.location_id = f.location_id
GROUP BY loc.location_id, loc.location_name, loc.city;


-- ==========================================================
-- 13. DATABASE TRIGGERS (INTEGRITY & BUSINESS LOGIC)
-- ==========================================================

DELIMITER $$

-- Trigger 1: BEFORE INSERT ON claim
-- Enforces business constraint: Cannot submit a claim on an already claimed/returned item.
DROP TRIGGER IF EXISTS trg_prevent_claim_on_closed_item$$
CREATE TRIGGER trg_prevent_claim_on_closed_item
BEFORE INSERT ON claim
FOR EACH ROW
BEGIN
    DECLARE item_current_status VARCHAR(50);

    SELECT status INTO item_current_status
    FROM found_item
    WHERE found_item_id = NEW.found_item_id;

    IF item_current_status IN ('Claimed', 'Returned') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Cannot claim this item because it has already been claimed or returned.';
    END IF;
END$$

-- Trigger 2: AFTER INSERT ON verification
-- Automated state propagation: When an admin approves a claim, update found_item status and notify claimant.
DROP TRIGGER IF EXISTS trg_after_verification_insert$$
CREATE TRIGGER trg_after_verification_insert
AFTER INSERT ON verification
FOR EACH ROW
BEGIN
    DECLARE claimant_user_id INT;
    DECLARE target_found_id INT;
    DECLARE target_item_name VARCHAR(150);

    -- Fetch claim details
    SELECT user_id, found_item_id INTO claimant_user_id, target_found_id
    FROM claim
    WHERE claim_id = NEW.claim_id;

    -- Fetch item name
    SELECT item_name INTO target_item_name
    FROM found_item
    WHERE found_item_id = target_found_id;

    IF NEW.status = 'Approved' THEN
        -- 1. Synchronize the claim status
        UPDATE claim 
        SET status = 'Approved' 
        WHERE claim_id = NEW.claim_id;

        -- 2. Mark the found item as Claimed
        UPDATE found_item 
        SET status = 'Claimed' 
        WHERE found_item_id = target_found_id;

        -- 3. Automatically dispatch notification to the claimant
        INSERT INTO notification (user_id, message, status)
        VALUES (
            claimant_user_id,
            CONCAT('Congratulations! Your claim for item "', target_item_name, '" was APPROVED. Please visit the Campus Office with ID proof.'),
            'Unread'
        );
    ELSEIF NEW.status = 'Rejected' THEN
        -- Synchronize claim status
        UPDATE claim 
        SET status = 'Rejected' 
        WHERE claim_id = NEW.claim_id;

        -- Notify claimant about rejection
        INSERT INTO notification (user_id, message, status)
        VALUES (
            claimant_user_id,
            CONCAT('Update on your claim for "', target_item_name, '": The claim was rejected. Remarks: ', IFNULL(NEW.remarks, 'No remarks provided.')),
            'Unread'
        );
    END IF;
END$$

-- Trigger 3: AFTER INSERT ON user
-- Automatically creates a welcome notification row for newly registered campus users.
DROP TRIGGER IF EXISTS trg_user_welcome_notification$$
CREATE TRIGGER trg_user_welcome_notification
AFTER INSERT ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO notification (user_id, message, status)
    VALUES (
        NEW.user_id,
        CONCAT('Welcome to Campus Lost & Found Network, ', NEW.name, '! Report any lost or found items to get started.'),
        'Unread'
    );
END$$

DELIMITER ;
