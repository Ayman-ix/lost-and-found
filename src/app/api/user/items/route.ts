import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lostRows = await query<any>(
      `SELECT 
        l.lost_item_id,
        l.item_name,
        l.brand,
        l.color,
        l.date_lost,
        l.status,
        l.created_at,
        c.category_name,
        loc.location_name,
        (SELECT image_url FROM item_image WHERE lost_item_id = l.lost_item_id LIMIT 1) AS image_url
      FROM lost_item l
      LEFT JOIN category c ON l.category_id = c.category_id
      LEFT JOIN location loc ON l.location_id = loc.location_id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC`,
      [session.userId]
    );

    const foundRows = await query<any>(
      `SELECT 
        f.found_item_id,
        f.item_name,
        f.brand,
        f.color,
        f.date_found,
        f.status,
        f.created_at,
        c.category_name,
        loc.location_name,
        (SELECT image_url FROM item_image WHERE found_item_id = f.found_item_id LIMIT 1) AS image_url
      FROM found_item f
      LEFT JOIN category c ON f.category_id = c.category_id
      LEFT JOIN location loc ON f.location_id = loc.location_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC`,
      [session.userId]
    );

    const lostItems = lostRows.map((i) => ({
      id: i.lost_item_id,
      type: 'lost' as const,
      name: i.item_name,
      brand: i.brand,
      color: i.color,
      date: i.date_lost,
      status: i.status,
      category: i.category_name || 'General',
      location: i.location_name || 'Campus',
      imageUrl: i.image_url || null,
    }));

    const foundItems = foundRows.map((i) => ({
      id: i.found_item_id,
      type: 'found' as const,
      name: i.item_name,
      brand: i.brand,
      color: i.color,
      date: i.date_found,
      status: i.status,
      category: i.category_name || 'General',
      location: i.location_name || 'Campus',
      imageUrl: i.image_url || null,
    }));

    return NextResponse.json({
      lostItems,
      foundItems,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading user items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
