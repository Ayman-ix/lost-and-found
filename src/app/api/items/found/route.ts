import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { matchFoundItemAgainstLost } from '@/lib/matcher';

// GET /api/items/found (Browse found items with search & filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('q');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
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
        loc.city AS location_city,
        img.image_id,
        img.image_url
      FROM found_item f
      LEFT JOIN \`user\` u ON f.user_id = u.user_id
      LEFT JOIN category c ON f.category_id = c.category_id
      LEFT JOIN location loc ON f.location_id = loc.location_id
      LEFT JOIN item_image img ON f.found_item_id = img.found_item_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category) {
      sql += ` AND f.category_id = ?`;
      params.push(category);
    }
    if (location) {
      sql += ` AND f.location_id = ?`;
      params.push(location);
    }
    if (status) {
      sql += ` AND f.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (f.item_name LIKE ? OR f.description LIKE ? OR f.brand LIKE ? OR f.color LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY f.created_at DESC`;

    const rows = await query<any>(sql, params);

    // Group rows by found_item_id to collect images array
    const itemMap = new Map<number, any>();

    for (const row of rows) {
      if (!itemMap.has(row.found_item_id)) {
        itemMap.set(row.found_item_id, {
          found_item_id: row.found_item_id,
          item_name: row.item_name,
          description: row.description,
          brand: row.brand,
          color: row.color,
          date_found: row.date_found,
          storage_location: row.storage_location,
          status: row.status,
          created_at: row.created_at,
          user: {
            user_id: row.user_id,
            name: row.user_name,
            email: row.user_email,
          },
          category: {
            category_id: row.category_id,
            category_name: row.category_name,
          },
          location: {
            location_id: row.location_id,
            location_name: row.location_name,
            city: row.location_city,
          },
          images: [],
        });
      }

      if (row.image_url) {
        itemMap.get(row.found_item_id).images.push({
          image_id: row.image_id,
          image_url: row.image_url,
        });
      }
    }

    return NextResponse.json({ items: Array.from(itemMap.values()) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve found items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/items/found (Report a found item)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to report a found item.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      itemName,
      categoryId,
      locationId,
      description,
      brand,
      color,
      dateFound,
      imageUrl,
    } = body;

    // Validate required fields
    if (!itemName || !categoryId || !locationId || !dateFound) {
      return NextResponse.json(
        { error: 'Item name, category, location, and date found are required.' },
        { status: 400 }
      );
    }

    // Insert into MySQL found_item
    const result = await execute(
      `INSERT INTO found_item (user_id, category_id, location_id, item_name, description, brand, color, date_found, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Found')`,
      [
        session.userId,
        Number(categoryId),
        Number(locationId),
        itemName.trim(),
        description?.trim() || null,
        brand?.trim() || null,
        color?.trim() || null,
        dateFound,
      ]
    );

    const foundItemId = result.insertId;

    // If image provided, insert into item_image table
    if (imageUrl && imageUrl.trim()) {
      await execute(
        `INSERT INTO item_image (found_item_id, image_url) VALUES (?, ?)`,
        [foundItemId, imageUrl.trim()]
      );
    }

    // Trigger Rule-Based Matching Algorithm
    const matches = await matchFoundItemAgainstLost(foundItemId, session.userId);

    return NextResponse.json({
      success: true,
      item: {
        found_item_id: foundItemId,
        item_name: itemName.trim(),
        status: 'Found',
      },
      matchesFound: matches.length,
      message:
        matches.length > 0
          ? `Thank you for reporting! We found ${matches.length} lost item report(s) matching this item. Owners have been notified.`
          : 'Found item successfully logged. Anyone who lost this item can now submit a claim.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error reporting found item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
