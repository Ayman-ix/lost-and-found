import { supabaseAdmin } from '@/lib/supabase-server';

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
 * Threshold: >= 40 pts creates a POTENTIAL_MATCH record in PostgreSQL.
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
  if (lost.category_id === found.category_id) {
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
  if (lost.location_id === found.location_id) {
    score += 20;
  }

  // 5. Date Proximity (+15 pts)
  // Found date should typically be on or after lost date, within reasonable threshold
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
  // Fetch the lost item details
  const { data: lostItem } = await supabaseAdmin
    .from('lost_item')
    .select('lost_item_id, item_name, category_id, location_id, brand, color, date_lost')
    .eq('lost_item_id', lostItemId)
    .single();

  if (!lostItem) return [];

  // Fetch all active found items (status: 'Found')
  const { data: foundCandidates } = await supabaseAdmin
    .from('found_item')
    .select('found_item_id, user_id, item_name, category_id, location_id, brand, color, date_found')
    .eq('status', 'Found');

  if (!foundCandidates || foundCandidates.length === 0) return [];

  const createdMatches = [];

  for (const found of foundCandidates) {
    const score = calculateMatchScore(
      {
        category_id: lostItem.category_id,
        location_id: lostItem.location_id,
        brand: lostItem.brand,
        color: lostItem.color,
        date: lostItem.date_lost,
      },
      {
        category_id: found.category_id,
        location_id: found.location_id,
        brand: found.brand,
        color: found.color,
        date: found.date_found,
      }
    );

    // Threshold check (>= 40)
    if (score >= 40) {
      const matchStatus = score >= 70 ? 'Possible' : 'Pending';

      // Insert into potential_match table (upsert to avoid duplicates)
      const { data: matchRecord, error } = await supabaseAdmin
        .from('potential_match')
        .upsert(
          [
            {
              lost_item_id: lostItem.lost_item_id,
              found_item_id: found.found_item_id,
              match_score: score,
              match_status: matchStatus,
            },
          ],
          { onConflict: 'lost_item_id,found_item_id' }
        )
        .select()
        .single();

      if (!error && matchRecord) {
        createdMatches.push(matchRecord);

        // Notify the user who reported the lost item
        await supabaseAdmin.from('notification').insert([
          {
            user_id: lostUserId,
            message: `Potential match found (${score}% score)! A found item "${found.item_name}" resembles your lost "${lostItem.item_name}".`,
            status: 'Unread',
          },
        ]);

        // Update lost_item status to 'Matched' if it was 'Lost'
        await supabaseAdmin
          .from('lost_item')
          .update({ status: 'Matched' })
          .eq('lost_item_id', lostItemId)
          .eq('status', 'Lost');
      }
    }
  }

  return createdMatches;
}

/**
 * Triggered when a new FOUND item is reported:
 * Compares against active LOST items and creates matches & notifications.
 */
export async function matchFoundItemAgainstLost(foundItemId: number, _foundUserId: number) {
  // Fetch the found item details
  const { data: foundItem } = await supabaseAdmin
    .from('found_item')
    .select('found_item_id, item_name, category_id, location_id, brand, color, date_found')
    .eq('found_item_id', foundItemId)
    .single();

  if (!foundItem) return [];

  // Fetch all active lost items (status: 'Lost' or 'Matched')
  const { data: lostCandidates } = await supabaseAdmin
    .from('lost_item')
    .select('lost_item_id, user_id, item_name, category_id, location_id, brand, color, date_lost')
    .in('status', ['Lost', 'Matched']);

  if (!lostCandidates || lostCandidates.length === 0) return [];

  const createdMatches = [];

  for (const lost of lostCandidates) {
    const score = calculateMatchScore(
      {
        category_id: lost.category_id,
        location_id: lost.location_id,
        brand: lost.brand,
        color: lost.color,
        date: lost.date_lost,
      },
      {
        category_id: foundItem.category_id,
        location_id: foundItem.location_id,
        brand: foundItem.brand,
        color: foundItem.color,
        date: foundItem.date_found,
      }
    );

    if (score >= 40) {
      const matchStatus = score >= 70 ? 'Possible' : 'Pending';

      const { data: matchRecord, error } = await supabaseAdmin
        .from('potential_match')
        .upsert(
          [
            {
              lost_item_id: lost.lost_item_id,
              found_item_id: foundItem.found_item_id,
              match_score: score,
              match_status: matchStatus,
            },
          ],
          { onConflict: 'lost_item_id,found_item_id' }
        )
        .select()
        .single();

      if (!error && matchRecord) {
        createdMatches.push(matchRecord);

        // Notify the owner of the lost item
        await supabaseAdmin.from('notification').insert([
          {
            user_id: lost.user_id,
            message: `Great news! A found item "${foundItem.item_name}" closely matches (${score}%) your reported lost item "${lost.item_name}".`,
            status: 'Unread',
          },
        ]);

        // Update lost_item status to 'Matched'
        await supabaseAdmin
          .from('lost_item')
          .update({ status: 'Matched' })
          .eq('lost_item_id', lost.lost_item_id)
          .eq('status', 'Lost');
      }
    }
  }

  return createdMatches;
}
