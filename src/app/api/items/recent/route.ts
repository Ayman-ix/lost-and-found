import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Fetch recent lost items (limit 4)
    const lostRows = await query<any>(`
      SELECT 
        l.lost_item_id,
        l.item_name,
        l.description,
        l.brand,
        l.color,
        l.date_lost,
        l.status,
        l.created_at,
        c.category_name,
        loc.location_name,
        loc.city AS location_city,
        (SELECT image_url FROM item_image WHERE lost_item_id = l.lost_item_id LIMIT 1) AS image_url
      FROM lost_item l
      LEFT JOIN category c ON l.category_id = c.category_id
      LEFT JOIN location loc ON l.location_id = loc.location_id
      ORDER BY l.created_at DESC
      LIMIT 4
    `);

    // 2. Fetch recent found items (limit 4)
    const foundRows = await query<any>(`
      SELECT 
        f.found_item_id,
        f.item_name,
        f.description,
        f.brand,
        f.color,
        f.date_found,
        f.status,
        f.created_at,
        c.category_name,
        loc.location_name,
        loc.city AS location_city,
        (SELECT image_url FROM item_image WHERE found_item_id = f.found_item_id LIMIT 1) AS image_url
      FROM found_item f
      LEFT JOIN category c ON f.category_id = c.category_id
      LEFT JOIN location loc ON f.location_id = loc.location_id
      ORDER BY f.created_at DESC
      LIMIT 4
    `);

    const formattedLost = lostRows.map((item) => ({
      id: item.lost_item_id,
      type: 'lost' as const,
      name: item.item_name,
      description: item.description,
      brand: item.brand,
      color: item.color,
      date: item.date_lost,
      status: item.status,
      createdAt: item.created_at,
      category: item.category_name || 'General',
      location: item.location_name || 'Campus',
      imageUrl: item.image_url || null,
    }));

    const formattedFound = foundRows.map((item) => ({
      id: item.found_item_id,
      type: 'found' as const,
      name: item.item_name,
      description: item.description,
      brand: item.brand,
      color: item.color,
      date: item.date_found,
      status: item.status,
      createdAt: item.created_at,
      category: item.category_name || 'General',
      location: item.location_name || 'Campus',
      imageUrl: item.image_url || null,
    }));

    return NextResponse.json({
      recentLost: formattedLost,
      recentFound: formattedFound,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching recent items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
