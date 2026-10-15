// database/seed_data.js
// Seeds realistic campus data into MySQL/TiDB database for production evaluation.
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const pool = mysql.createPool({
    uri: databaseUrl,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
  });

  try {
    console.log('1. Updating Admin account password...');
    const adminHash = await bcrypt.hash('AdminSecure2026!', 10);
    await pool.query(
      `INSERT INTO admin (admin_id, name, email, password)
       VALUES (1, 'Campus Administrator', 'admin@campus.edu', ?)
       ON DUPLICATE KEY UPDATE password = VALUES(password), name = VALUES(name)`,
      [adminHash]
    );

    console.log('2. Seeding realistic campus users...');
    const userPass = await bcrypt.hash('Student123!', 10);
    const users = [
      [1, 'Rahul Sharma', 'rahul.s@campus.edu', '+91 98765 43210', userPass],
      [2, 'Ananya Sen', 'ananya.sen@campus.edu', '+91 98123 45678', userPass],
      [3, 'Rohan Mehta', 'rohan.m@campus.edu', '+91 97234 56789', userPass],
      [4, 'Priya Patel', 'priya.p@campus.edu', '+91 96345 67890', userPass],
      [5, 'Vikram Verma', 'vikram.v@campus.edu', '+91 95456 78901', userPass],
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO user (user_id, name, email, phone, password)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
        u
      );
    }

    console.log('3. Seeding categories and locations...');
    const categories = [
      [1, 'Electronics', 'Phones, laptops, chargers, headphones, smartwatches, calculators'],
      [2, 'Wallets & Bags', 'Backpacks, purses, handbags, wallets, tote bags'],
      [3, 'Keys & Access Cards', 'Dorm keys, car keys, RFID badges, keychains'],
      [4, 'Documents & IDs', 'Student IDs, driver licenses, passports, notebooks, binders'],
      [5, 'Clothing & Accessories', 'Jackets, hoodies, caps, umbrellas, sunglasses, scarves'],
      [6, 'Jewellery & Watches', 'Rings, necklaces, analog watches, bracelets'],
      [7, 'Books & Stationary', 'Textbooks, pencil cases, scientific calculators'],
      [8, 'Other', 'Water bottles, sports gear, musical instruments'],
    ];
    for (const c of categories) {
      await pool.query(
        `INSERT INTO category (category_id, category_name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE category_name = VALUES(category_name), description = VALUES(description)`,
        c
      );
    }

    const locations = [
      [1, 'Central Campus Library', 'Main Campus', 'Building A, 1st & 2nd Floor Study Commons'],
      [2, 'Student Activities Center', 'Main Campus', 'West Wing, Food Court & Lounge'],
      [3, 'Science & Engineering Complex', 'North Campus', 'Block C, Laboratories & Lecture Halls'],
      [4, 'Sports Gymnasium & Arena', 'South Campus', 'Court 1 & Locker Room Entry'],
      [5, 'Campus Cafeteria & Dining Hall', 'Central Hub', 'Main Dining Area & Patio'],
      [6, 'North Student Residence Hall', 'Residential Quad', 'Lobby & Common Room'],
      [7, 'University Health Center', 'Main Campus', 'Reception & Waiting Lounge'],
      [8, 'Administration Building', 'Main Campus', 'Ground Floor Information Desk'],
    ];
    for (const l of locations) {
      await pool.query(
        `INSERT INTO location (location_id, location_name, city, address) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE location_name = VALUES(location_name), address = VALUES(address)`,
        l
      );
    }

    console.log('4. Seeding realistic lost items...');
    const lostItems = [
      [
        1, 1, 1, 1,
        'iPhone 14 (Midnight Black)',
        'Lost during evening study session near 2nd-floor quiet cubicles. Has a matte black Spigen bumper case and a small scratch near speaker grill.',
        'Apple', 'Black', '2026-10-10', 'Matched'
      ],
      [
        2, 2, 2, 4,
        'JanSport SuperBreak Backpack (Navy Blue)',
        'Left near bleachers during basketball practice. Contains computer science notebooks and a stainless steel water bottle.',
        'JanSport', 'Blue', '2026-10-08', 'Matched'
      ],
      [
        3, 3, 6, 2,
        'Titan Classique Analog Watch',
        'Brown leather strap with rose-gold metallic bezel. Left near the ping-pong recreation tables.',
        'Titan', 'Brown', '2026-10-11', 'Lost'
      ],
      [
        4, 4, 3, 6,
        'Dorm Key Ring with Brass Tag',
        'Set of two Yale keys attached to a circular bronze keychain stamped with room 304.',
        'Yale', 'Gold', '2026-10-12', 'Lost'
      ],
      [
        5, 5, 4, 1,
        'Student ID Card & Metro Pass',
        'Blue university lanyard with student ID card of Vikram Verma (ID: CS2024-089) and city transit pass.',
        'University', 'Blue', '2026-10-13', 'Lost'
      ],
      [
        6, 1, 1, 3,
        'Sony WH-1000XM4 Noise Cancelling Headphones',
        'Black over-ear wireless headphones in their original hard travel case. Forgotten in Room 204.',
        'Sony', 'Black', '2026-10-12', 'Lost'
      ],
      [
        7, 2, 7, 5,
        'Casio FX-991EX Scientific Calculator',
        'Standard engineering calculator with black sliding cover. Has sticker initials "AS" on the rear.',
        'Casio', 'Black', '2026-10-14', 'Lost'
      ],
    ];

    for (const item of lostItems) {
      await pool.query(
        `INSERT INTO lost_item (lost_item_id, user_id, category_id, location_id, item_name, description, brand, color, date_lost, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE item_name = VALUES(item_name), status = VALUES(status), description = VALUES(description)`,
        item
      );
    }

    console.log('5. Seeding realistic found items...');
    const foundItems = [
      [
        1, 3, 1, 1,
        'Apple Smartphone in Black Case',
        'Discovered by cleaning staff under table 14 in Central Library 2nd floor. Device is locked with passcode screen.',
        'Apple', 'Black', '2026-10-11',
        'Security Office Safe #A3', 'Claimed'
      ],
      [
        2, 4, 2, 4,
        'Blue Navy Backpack with Books',
        'Found unattended near Gym bleachers after 6 PM games. Handed to athletic facility manager.',
        'JanSport', 'Blue', '2026-10-09',
        'Sports Complex Desk', 'Found'
      ],
      [
        3, 5, 2, 5,
        'Brown Leather Bifold Wallet',
        'Found on dining table in Central Cafeteria. Contains some cash and department store card, no student ID.',
        'Wildhorn', 'Brown', '2026-10-13',
        'Central Hub Security Office', 'Found'
      ],
      [
        4, 2, 3, 6,
        'Pair of Brass Dorm Keys',
        'Two room keys found on walkway outside North Residence Hall.',
        'Yale', 'Brass', '2026-10-13',
        'North Quad Reception', 'Found'
      ],
      [
        5, 1, 5, 2,
        'Columbia Fleece Jacket (Charcoal Gray)',
        'Zipper fleece jacket forgotten over chair in Student Activities Center 1st floor lounge.',
        'Columbia', 'Gray', '2026-10-14',
        'Activities Center Information Desk', 'Found'
      ],
      [
        6, 4, 1, 3,
        'USB-C 65W Fast Charger (White)',
        'Left plugged into wall outlet in Science & Engineering Room C-102.',
        'Anker', 'White', '2026-10-14',
        'Block C Lab Assistant Desk', 'Found'
      ],
    ];

    for (const f of foundItems) {
      await pool.query(
        `INSERT INTO found_item (found_item_id, user_id, category_id, location_id, item_name, description, brand, color, date_found, storage_location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE item_name = VALUES(item_name), status = VALUES(status), storage_location = VALUES(storage_location)`,
        f
      );
    }

    console.log('6. Seeding potential matches...');
    const matches = [
      // Lost iPhone (id 1) vs Found Apple Phone (id 1) -> Score 95%
      [1, 1, 1, 95.00, 'Possible'],
      // Lost Blue Backpack (id 2) vs Found Blue Backpack (id 2) -> Score 95%
      [2, 2, 2, 95.00, 'Possible'],
      // Lost Dorm Keys (id 4) vs Found Keys (id 4) -> Score 75%
      [3, 4, 4, 75.00, 'Possible'],
    ];

    for (const m of matches) {
      await pool.query(
        `INSERT INTO potential_match (match_id, lost_item_id, found_item_id, match_score, match_status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), match_status = VALUES(match_status)`,
        m
      );
    }

    console.log('7. Seeding claims & admin verification...');
    // Claim 1: Rahul claiming the iPhone 14 (Approved)
    await pool.query(
      `INSERT INTO claim (claim_id, found_item_id, user_id, proof, status, claim_date)
       VALUES (1, 1, 1, 'Lockscreen wallpaper is a photo of Golden Gate Bridge. IMEI ends in 4921, verified with Apple purchase invoice.', 'Approved', '2026-10-12 14:30:00')
       ON DUPLICATE KEY UPDATE status = VALUES(status), proof = VALUES(proof)`
    );

    // Verification 1: Admin approved Claim 1
    await pool.query(
      `INSERT INTO verification (verification_id, claim_id, admin_id, remarks, status, verification_date)
       VALUES (1, 1, 1, 'Claimant presented original Apple digital receipt and unlocked the phone with passcode.', 'Approved', '2026-10-12 16:15:00')
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`
    );

    // Claim 2: Ananya claiming the Blue Backpack (Pending)
    await pool.query(
      `INSERT INTO claim (claim_id, found_item_id, user_id, proof, status, claim_date)
       VALUES (2, 2, 2, 'Front pocket has a blue Parker pen and a keychain with a small Eiffel Tower charm.', 'Pending', '2026-10-13 10:10:00')
       ON DUPLICATE KEY UPDATE status = VALUES(status), proof = VALUES(proof)`
    );

    console.log('8. Seeding user notifications...');
    const notifications = [
      [1, 1, 'High Confidence Match Found! Found item "Apple Smartphone in Black Case" matches your lost "iPhone 14" with a 95% match score.', 'Read'],
      [2, 1, 'Congratulations! Your claim for "Apple Smartphone in Black Case" has been APPROVED. Please retrieve it from Security Safe #A3.', 'Read'],
      [3, 2, 'Potential Match Found (95% score)! A found item "Blue Navy Backpack with Books" closely matches your lost "JanSport SuperBreak Backpack".', 'Unread'],
      [4, 4, 'Potential Match Alert (75% score)! "Pair of Brass Dorm Keys" found at North Student Residence Hall may belong to you.', 'Unread'],
    ];

    for (const n of notifications) {
      await pool.query(
        `INSERT INTO notification (notification_id, user_id, message, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE message = VALUES(message), status = VALUES(status)`,
        n
      );
    }

    console.log('✅ Database seeding complete! Summary:');
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM user) AS users,
        (SELECT COUNT(*) FROM lost_item) AS lost,
        (SELECT COUNT(*) FROM found_item) AS found,
        (SELECT COUNT(*) FROM potential_match) AS matches,
        (SELECT COUNT(*) FROM claim) AS claims,
        (SELECT COUNT(*) FROM verification WHERE status = 'Approved') AS reunions
    `);
    console.table(stats[0]);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
