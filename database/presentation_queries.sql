-- ==========================================================
-- LOST & FOUND NETWORK - SQL QUERIES FOR PRESENTATION / VIVA
-- Target Tool: MySQL Workbench
-- Database: lost_and_found_db
-- ==========================================================

USE lost_and_found_db;

-- ==========================================================
-- 1. BASIC TABLE INSPECTION & DDL CHECKS
-- ==========================================================

-- 1.1 View all registered users (excluding sensitive password hash if presenting)
SELECT user_id, name, email, phone, created_at 
FROM `user`
ORDER BY created_at DESC;

-- 1.2 View all item categories
SELECT category_id, category_name, description 
FROM `category`;

-- 1.3 View campus locations
SELECT location_id, location_name, city, address 
FROM `location`;


-- ==========================================================
-- 2. RELATIONAL JOINS (MULTI-TABLE QUERIES)
-- ==========================================================

-- 2.1 INNER JOIN: Detailed report of all Lost Items with User, Category, and Location
SELECT 
    l.lost_item_id,
    l.item_name,
    c.category_name,
    loc.location_name,
    u.name AS reported_by,
    u.email AS contact_email,
    l.date_lost,
    l.status
FROM lost_item l
JOIN `user` u ON l.user_id = u.user_id
JOIN `category` c ON l.category_id = c.category_id
JOIN `location` loc ON l.location_id = loc.location_id
ORDER BY l.date_lost DESC;

-- 2.2 INNER JOIN: Detailed report of all Found Items and their current storage location
SELECT 
    f.found_item_id,
    f.item_name,
    c.category_name,
    loc.location_name AS found_at_location,
    u.name AS finder_name,
    f.storage_location,
    f.date_found,
    f.status
FROM found_item f
JOIN `user` u ON f.user_id = u.user_id
JOIN `category` c ON f.category_id = c.category_id
JOIN `location` loc ON f.location_id = loc.location_id
ORDER BY f.date_found DESC;

-- 2.3 3-WAY JOIN: Claims with Claimer details and the Found Item being claimed
SELECT 
    cl.claim_id,
    f.item_name AS item_claimed,
    u.name AS claimant_name,
    u.email AS claimant_email,
    cl.proof AS submitted_proof,
    cl.status AS claim_status,
    cl.claim_date
FROM claim cl
JOIN found_item f ON cl.found_item_id = f.found_item_id
JOIN `user` u ON cl.user_id = u.user_id
ORDER BY cl.claim_date DESC;


-- ==========================================================
-- 3. AGGREGATIONS & GROUP BY (DATA ANALYTICS)
-- ==========================================================

-- 3.1 Item distribution by category (shows database statistics)
SELECT 
    c.category_name,
    COUNT(l.lost_item_id) AS total_lost_items
FROM category c
LEFT JOIN lost_item l ON c.category_id = l.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_lost_items DESC;

-- 3.2 High-loss zones (Campus locations where most items are lost)
SELECT 
    loc.location_name,
    loc.city,
    COUNT(l.lost_item_id) AS lost_incidents_count
FROM location loc
LEFT JOIN lost_item l ON loc.location_id = l.location_id
GROUP BY loc.location_id, loc.location_name, loc.city
ORDER BY lost_incidents_count DESC;

-- 3.3 System Overview Stats (Single query summary)
SELECT
    (SELECT COUNT(*) FROM `user`) AS total_users,
    (SELECT COUNT(*) FROM lost_item) AS total_lost_items,
    (SELECT COUNT(*) FROM found_item) AS total_found_items,
    (SELECT COUNT(*) FROM claim WHERE status = 'Pending') AS pending_claims,
    (SELECT COUNT(*) FROM verification WHERE status = 'Approved') AS successful_reunions;


-- ==========================================================
-- 4. SUBQUERIES & ADVANCED MATCHMAKING LOGIC
-- ==========================================================

-- 4.1 Automated Matchmaking Algorithm: Find matching Lost & Found items
-- (Matches items that share the exact Category and Location)
SELECT 
    l.lost_item_id,
    l.item_name AS lost_item,
    f.found_item_id,
    f.item_name AS found_item,
    c.category_name,
    loc.location_name,
    l.date_lost,
    f.date_found
FROM lost_item l
JOIN found_item f 
    ON l.category_id = f.category_id 
    AND l.location_id = f.location_id
JOIN category c ON l.category_id = c.category_id
JOIN location loc ON l.location_id = loc.location_id
WHERE l.status = 'Lost' AND f.status = 'Found';

-- 4.2 Correlated Subquery: Find active users who have both lost and found records
SELECT 
    u.user_id,
    u.name,
    u.email,
    (SELECT COUNT(*) FROM lost_item WHERE user_id = u.user_id) AS reported_lost_count,
    (SELECT COUNT(*) FROM found_item WHERE user_id = u.user_id) AS reported_found_count
FROM `user` u
HAVING reported_lost_count > 0 OR reported_found_count > 0;

-- 4.3 Admin Verification Audit Trail (Auditing who approved what claim)
SELECT 
    v.verification_id,
    v.verification_date,
    v.status AS decision,
    v.remarks,
    a.name AS verified_by_admin,
    cl.claim_id,
    u.name AS claimant_name,
    f.item_name AS item_name
FROM verification v
JOIN admin a ON v.admin_id = a.admin_id
JOIN claim cl ON v.claim_id = cl.claim_id
JOIN `user` u ON cl.user_id = u.user_id
JOIN found_item f ON cl.found_item_id = f.found_item_id
ORDER BY v.verification_date DESC;


-- ==========================================================
-- 5. DATABASE VIEWS DEMONSTRATION
-- ==========================================================

-- 5.1 Query the Active Lost Items View (Simplified projection without passwords)
SELECT * FROM v_active_lost_items
ORDER BY date_lost DESC
LIMIT 10;

-- 5.2 Query the Active Found Items View (Ready for claim matching)
SELECT * FROM v_active_found_items
WHERE campus_zone = 'Main Campus';

-- 5.3 Query the Claims & Verification Audit View
SELECT 
    claim_id,
    item_claimed,
    claimant_name,
    claim_status,
    admin_decision,
    verified_by
FROM v_claims_dashboard;

-- 5.4 Query the Campus Hotspots Analytics View
SELECT 
    location_name,
    campus_zone,
    total_lost_reports,
    total_found_reports,
    (total_lost_reports + total_found_reports) AS total_incidents
FROM v_campus_hotspots
ORDER BY total_incidents DESC;


-- ==========================================================
-- 6. COMPLETE SQL SUB-LANGUAGES (DDL, DML, TCL, DCL)
-- ==========================================================

-- ----------------------------------------------------------
-- 6.1 DDL (Data Definition Language)
-- Creates, modifies, and alters database structure and schemas
-- ----------------------------------------------------------

-- Example: Add an optional index or modify table schema
ALTER TABLE `lost_item` 
ADD INDEX idx_lost_date (`date_lost`);

-- Example: Drop an index (schema modification)
-- ALTER TABLE `lost_item` DROP INDEX idx_lost_date;


-- ----------------------------------------------------------
-- 6.2 DML (Data Manipulation Language)
-- Inserts, selects, updates, and deletes row-level records
-- ----------------------------------------------------------

-- INSERT:
-- INSERT INTO `location` (`location_name`, `city`, `address`) 
-- VALUES ('Innovation Hub', 'Tech Quad', 'Level 2 Maker Space');

-- UPDATE:
-- UPDATE `found_item` 
-- SET `storage_location` = 'Security Locker B-12' 
-- WHERE `found_item_id` = 1;

-- DELETE:
-- DELETE FROM `notification` 
-- WHERE `status` = 'Read' AND `notification_date` < NOW() - INTERVAL 30 DAY;


-- ----------------------------------------------------------
-- 6.3 TCL (Transaction Control Language)
-- Manages atomic transactional boundaries, savepoints, and rollbacks
-- ----------------------------------------------------------

-- Demonstration of an ACID-compliant Atomic Claim Verification Transaction:
START TRANSACTION;

-- Step 1: Record admin verification decision
INSERT INTO `verification` (`claim_id`, `admin_id`, `remarks`, `status`)
VALUES (1, 1, 'Student ID card matched photo and serial number.', 'Approved');

-- Step 2: Establish a transactional savepoint
SAVEPOINT claim_approved;

-- Step 3: Update item status to Returned
UPDATE `found_item`
SET `status` = 'Returned'
WHERE `found_item_id` = (SELECT found_item_id FROM claim WHERE claim_id = 1);

-- Step 4: Finalize and commit all changes permanently
COMMIT;

-- Note: If any validation fails, we can rollback:
-- ROLLBACK TO SAVEPOINT claim_approved;
-- or completely:
-- ROLLBACK;


-- ----------------------------------------------------------
-- 6.4 DCL (Data Control Language)
-- Manages privileges, permissions, and security roles
-- ----------------------------------------------------------

-- Create a restricted application user for production web backend
CREATE USER IF NOT EXISTS 'lf_web_app'@'%' IDENTIFIED BY 'StrongAppPassword2026!';

-- GRANT: Grant least-privilege DML access only on this database
GRANT SELECT, INSERT, UPDATE, DELETE ON lost_and_found_db.* TO 'lf_web_app'@'%';

-- Create an auditor account with read-only access to views
CREATE USER IF NOT EXISTS 'lf_auditor'@'%' IDENTIFIED BY 'AuditViewOnly2026!';

-- GRANT: Allow the auditor to ONLY read specific aggregated views
GRANT SELECT ON lost_and_found_db.v_claims_dashboard TO 'lf_auditor'@'%';
GRANT SELECT ON lost_and_found_db.v_campus_hotspots TO 'lf_auditor'@'%';

-- REVOKE: Demonstrate revoking DELETE privileges to prevent accidental data loss
REVOKE DELETE ON lost_and_found_db.* FROM 'lf_web_app'@'%';

-- Flush privilege cache to enforce immediate updates
FLUSH PRIVILEGES;
