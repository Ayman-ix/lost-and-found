import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const rawId = params.id; // e.g. "lost-1" or "found-2" or "1"

    let type: 'lost' | 'found' = 'lost';
    let numericId: number;

    if (rawId.startsWith('lost-')) {
      type = 'lost';
      numericId = parseInt(rawId.replace('lost-', ''), 10);
    } else if (rawId.startsWith('found-')) {
      type = 'found';
      numericId = parseInt(rawId.replace('found-', ''), 10);
    } else {
      numericId = parseInt(rawId, 10);
    }

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    if (type === 'lost') {
      const itemRow = await queryOne<any>(
        `SELECT 
          l.lost_item_id,
          l.item_name,
          l.description,
          l.brand,
          l.color,
          l.date_lost,
          l.status,
          l.created_at,
          u.user_id,
          u.name AS user_name,
          u.email AS user_email,
          c.category_id,
          c.category_name,
          loc.location_id,
          loc.location_name,
          loc.city AS location_city
        FROM lost_item l
        LEFT JOIN \`user\` u ON l.user_id = u.user_id
        LEFT JOIN category c ON l.category_id = c.category_id
        LEFT JOIN location loc ON l.location_id = loc.location_id
        WHERE l.lost_item_id = ?`,
        [numericId]
      );

      if (!itemRow) {
        return NextResponse.json({ error: 'Lost item not found' }, { status: 404 });
      }

      const images = await query<any>(
        `SELECT image_id, image_url FROM item_image WHERE lost_item_id = ?`,
        [numericId]
      );

      const item = {
        lost_item_id: itemRow.lost_item_id,
        item_name: itemRow.item_name,
        description: itemRow.description,
        brand: itemRow.brand,
        color: itemRow.color,
        date_lost: itemRow.date_lost,
        status: itemRow.status,
        created_at: itemRow.created_at,
        user: {
          user_id: itemRow.user_id,
          name: itemRow.user_name,
          email: itemRow.user_email,
        },
        category: {
          category_id: itemRow.category_id,
          category_name: itemRow.category_name,
        },
        location: {
          location_id: itemRow.location_id,
          location_name: itemRow.location_name,
          city: itemRow.location_city,
        },
        images,
      };

      // Fetch potential matches for this lost item
      const matchRows = await query<any>(
        `SELECT 
          m.match_id,
          m.match_score,
          m.match_status,
          f.found_item_id,
          f.item_name,
          f.brand,
          f.color,
          f.date_found,
          f.status AS found_status,
          loc.location_name
        FROM potential_match m
        JOIN found_item f ON m.found_item_id = f.found_item_id
        LEFT JOIN location loc ON f.location_id = loc.location_id
        WHERE m.lost_item_id = ?
        ORDER BY m.match_score DESC`,
        [numericId]
      );

      const matches = matchRows.map((m) => ({
        match_id: m.match_id,
        match_score: m.match_score,
        match_status: m.match_status,
        found_item: {
          found_item_id: m.found_item_id,
          item_name: m.item_name,
          brand: m.brand,
          color: m.color,
          date_found: m.date_found,
          status: m.found_status,
          location: {
            location_name: m.location_name,
          },
        },
      }));

      return NextResponse.json({
        type: 'lost',
        item,
        matches,
      });
    } else {
      const itemRow = await queryOne<any>(
        `SELECT 
          f.found_item_id,
          f.item_name,
          f.description,
          f.brand,
          f.color,
          f.date_found,
          f.storage_location,
          f.status,
          f.created_at,
          u.user_id,
          u.name AS user_name,
          u.email AS user_email,
          c.category_id,
          c.category_name,
          loc.location_id,
          loc.location_name,
          loc.city AS location_city
        FROM found_item f
        LEFT JOIN \`user\` u ON f.user_id = u.user_id
        LEFT JOIN category c ON f.category_id = c.category_id
        LEFT JOIN location loc ON f.location_id = loc.location_id
        WHERE f.found_item_id = ?`,
        [numericId]
      );

      if (!itemRow) {
        return NextResponse.json({ error: 'Found item not found' }, { status: 404 });
      }

      const images = await query<any>(
        `SELECT image_id, image_url FROM item_image WHERE found_item_id = ?`,
        [numericId]
      );

      const item = {
        found_item_id: itemRow.found_item_id,
        item_name: itemRow.item_name,
        description: itemRow.description,
        brand: itemRow.brand,
        color: itemRow.color,
        date_found: itemRow.date_found,
        storage_location: itemRow.storage_location,
        status: itemRow.status,
        created_at: itemRow.created_at,
        user: {
          user_id: itemRow.user_id,
          name: itemRow.user_name,
          email: itemRow.user_email,
        },
        category: {
          category_id: itemRow.category_id,
          category_name: itemRow.category_name,
        },
        location: {
          location_id: itemRow.location_id,
          location_name: itemRow.location_name,
          city: itemRow.location_city,
        },
        images,
      };

      // Fetch potential matches for this found item
      const matchRows = await query<any>(
        `SELECT 
          m.match_id,
          m.match_score,
          m.match_status,
          l.lost_item_id,
          l.item_name,
          l.brand,
          l.color,
          l.date_lost,
          l.status AS lost_status,
          loc.location_name
        FROM potential_match m
        JOIN lost_item l ON m.lost_item_id = l.lost_item_id
        LEFT JOIN location loc ON l.location_id = loc.location_id
        WHERE m.found_item_id = ?
        ORDER BY m.match_score DESC`,
        [numericId]
      );

      const matches = matchRows.map((m) => ({
        match_id: m.match_id,
        match_score: m.match_score,
        match_status: m.match_status,
        lost_item: {
          lost_item_id: m.lost_item_id,
          item_name: m.item_name,
          brand: m.brand,
          color: m.color,
          date_lost: m.date_lost,
          status: m.lost_status,
          location: {
            location_name: m.location_name,
          },
        },
      }));

      return NextResponse.json({
        type: 'found',
        item,
        matches,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
