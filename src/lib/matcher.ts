import { query, queryOne, execute } from '@/lib/db';

/**
 * DBMS Viva Explanation:
 * Rule-Based Matching Algorithm for Lost & Found items.
 * Evaluates attributes and calculates a match score out of 100:
 * - Category match:       +25 pts
 * - Brand match:          +25 pts
 * - Color match:          +15 pts
 * - Location match:       +20 pts
 * - Date proximity (<=7d): +15 pts
 * ------------------------------
 * Maximum:                100 pts
 *
 * Threshold: >= 40 pts creates a POTENTIAL_MATCH record in MySQL.
 */

export interface ItemAttributes {
  category_id: number;
  location_id: number;
  brand?: string | null;
  color?: string | null;
  date: string; // YYYY-MM-DD
}

export function calculateMatchScore(lost: ItemAttributes, found: ItemAttributes): number {
  let score = 0;

  // 1. Same Category (+25 pts)
  if (Number(lost.category_id) === Number(found.category_id)) {
    score += 25;
  }

  // 2. Same or Similar Brand (+25 pts)
  if (lost.brand && found.brand) {
    const lBrand = lost.brand.trim().toLowerCase();
    const fBrand = found.brand.trim().toLowerCase();
    if (lBrand === fBrand) {
      score += 25;
    } else if (lBrand.includes(fBrand) || fBrand.includes(lBrand)) {
      score += 15;
    }
  }

  // 3. Same or Similar Color (+15 pts)
  if (lost.color && found.color) {
    const lColor = lost.color.trim().toLowerCase();
    const fColor = found.color.trim().toLowerCase();
    if (lColor === fColor) {
      score += 15;
    } else if (lColor.includes(fColor) || fColor.includes(lColor)) {
      score += 10;
    }
  }

  // 4. Same Location (+20 pts)
  if (Number(lost.location_id) === Number(found.location_id)) {
    score += 20;
  }

  // 5. Date Proximity (+15 pts)
  if (lost.date && found.date) {
    const lostTime = new Date(lost.date).getTime();
    const foundTime = new Date(found.date).getTime();
    const diffDays = Math.abs(foundTime - lostTime) / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) {
      score += 15;
    } else if (diffDays <= 7) {
      score += 10;
    } else if (diffDays <= 14) {
      score += 5;
    }
  }

  return Math.min(score, 100);
}

/**
 * Triggered when a new LOST item is reported:
 * Compares against active FOUND items and creates matches & notifications.
 */
export async function matchLostItemAgainstFound(lostItemId: number, lostUserId: number) {
  try {
    const lostItem = await queryOne<any>(
      `SELECT lost_item_id, item_name, category_id, location_id, brand, color, date_lost
       FROM lost_item
       WHERE lost_item_id = ?`,
      [lostItemId]
    );

    if (!lostItem) return [];

    const foundCandidates = await query<any>(
      `SELECT found_item_id, user_id, item_name, category_id, location_id, brand, color, date_found
       FROM found_item
       WHERE status = 'Found'`
    );

    if (!foundCandidates || foundCandidates.length === 0) return [];

    const createdMatches = [];

    for (const found of foundCandidates) {
      const score = calculateMatchScore(
        {
          category_id: lostItem.category_id,
          location_id: lostItem.location_id,
          brand: lostItem.brand,
          color: lostItem.color,
          date: String(lostItem.date_lost),
        },
        {
          category_id: found.category_id,
          location_id: found.location_id,
          brand: found.brand,
          color: found.color,
          date: String(found.date_found),
        }
      );

      if (score >= 40) {
        const matchStatus = score >= 70 ? 'Possible' : 'Pending';

        // Upsert into potential_match table
        await execute(
          `INSERT INTO potential_match (lost_item_id, found_item_id, match_score, match_status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), match_status = VALUES(match_status)`,
          [lostItem.lost_item_id, found.found_item_id, score, matchStatus]
        );

        createdMatches.push({
          lost_item_id: lostItem.lost_item_id,
          found_item_id: found.found_item_id,
          match_score: score,
          match_status: matchStatus,
        });

        // Notify the user who reported the lost item
        await execute(
          `INSERT INTO notification (user_id, message, status)
           VALUES (?, ?, 'Unread')`,
          [
            lostUserId,
            `Potential match found (${score}% score)! A found item "${found.item_name}" resembles your lost "${lostItem.item_name}".`,
          ]
        );

        // Update lost_item status to 'Matched' if it was 'Lost'
        await execute(
          `UPDATE lost_item SET status = 'Matched' WHERE lost_item_id = ? AND status = 'Lost'`,
          [lostItemId]
        );
      }
    }

    return createdMatches;
  } catch (err) {
    console.error('Error in matchLostItemAgainstFound:', err);
    return [];
  }
}

/**
 * Triggered when a new FOUND item is reported:
 * Compares against active LOST items and creates matches & notifications.
 */
export async function matchFoundItemAgainstLost(foundItemId: number, _foundUserId: number) {
  try {
    const foundItem = await queryOne<any>(
      `SELECT found_item_id, item_name, category_id, location_id, brand, color, date_found
       FROM found_item
       WHERE found_item_id = ?`,
      [foundItemId]
    );

    if (!foundItem) return [];

    const lostCandidates = await query<any>(
      `SELECT lost_item_id, user_id, item_name, category_id, location_id, brand, color, date_lost
       FROM lost_item
       WHERE status IN ('Lost', 'Matched')`
    );

    if (!lostCandidates || lostCandidates.length === 0) return [];

    const createdMatches = [];

    for (const lost of lostCandidates) {
      const score = calculateMatchScore(
        {
          category_id: lost.category_id,
          location_id: lost.location_id,
          brand: lost.brand,
          color: lost.color,
          date: String(lost.date_lost),
        },
        {
          category_id: foundItem.category_id,
          location_id: foundItem.location_id,
          brand: foundItem.brand,
          color: foundItem.color,
          date: String(foundItem.date_found),
        }
      );

      if (score >= 40) {
        const matchStatus = score >= 70 ? 'Possible' : 'Pending';

        await execute(
          `INSERT INTO potential_match (lost_item_id, found_item_id, match_score, match_status)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE match_score = VALUES(match_score), match_status = VALUES(match_status)`,
          [lost.lost_item_id, foundItem.found_item_id, score, matchStatus]
        );

        createdMatches.push({
          lost_item_id: lost.lost_item_id,
          found_item_id: foundItem.found_item_id,
          match_score: score,
          match_status: matchStatus,
        });

        // Notify the user who reported the lost item
        await execute(
          `INSERT INTO notification (user_id, message, status)
           VALUES (?, ?, 'Unread')`,
          [
            lost.user_id,
            `Great news! A new found item "${foundItem.item_name}" matches your lost "${lost.item_name}" with a ${score}% score. Check matches now!`,
          ]
        );

        // Update lost_item status
        await execute(
          `UPDATE lost_item SET status = 'Matched' WHERE lost_item_id = ? AND status = 'Lost'`,
          [lost.lost_item_id]
        );
      }
    }

    return createdMatches;
  } catch (err) {
    console.error('Error in matchFoundItemAgainstLost:', err);
    return [];
  }
}
