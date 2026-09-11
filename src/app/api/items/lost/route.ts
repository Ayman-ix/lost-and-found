import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/session';
import { matchLostItemAgainstFound } from '@/lib/matcher';

// GET /api/items/lost (Browse lost items with search & filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('q');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
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
        loc.city AS location_city,
        img.image_id,
        img.image_url
      FROM lost_item l
      LEFT JOIN \`user\` u ON l.user_id = u.user_id
      LEFT JOIN category c ON l.category_id = c.category_id
      LEFT JOIN location loc ON l.location_id = loc.location_id
      LEFT JOIN item_image img ON l.lost_item_id = img.lost_item_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (category) {
      sql += ` AND l.category_id = ?`;
      params.push(category);
    }
    if (location) {
      sql += ` AND l.location_id = ?`;
      params.push(location);
    }
    if (status) {
      sql += ` AND l.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (l.item_name LIKE ? OR l.description LIKE ? OR l.brand LIKE ? OR l.color LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const rows = await query<any>(sql, params);

    // Group rows by lost_item_id to collect images array
    const itemMap = new Map<number, any>();

    for (const row of rows) {
      if (!itemMap.has(row.lost_item_id)) {
        itemMap.set(row.lost_item_id, {
          lost_item_id: row.lost_item_id,
          item_name: row.item_name,
          description: row.description,
          brand: row.brand,
          color: row.color,
          date_lost: row.date_lost,
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
        itemMap.get(row.lost_item_id).images.push({
          image_id: row.image_id,
          image_url: row.image_url,
        });
      }
    }

    return NextResponse.json({ items: Array.from(itemMap.values()) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve lost items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/items/lost (Report a lost item)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to report a lost item.' },
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
      dateLost,
      imageUrl,
    } = body;

    // Validate required fields
    if (!itemName || !categoryId || !locationId || !dateLost) {
      return NextResponse.json(
        { error: 'Item name, category, location, and date lost are required.' },
        { status: 400 }
      );
    }

    // Insert into MySQL lost_item
    const result = await execute(
      `INSERT INTO lost_item (user_id, category_id, location_id, item_name, description, brand, color, date_lost, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Lost')`,
      [
        session.userId,
        Number(categoryId),
        Number(locationId),
        itemName.trim(),
        description?.trim() || null,
        brand?.trim() || null,
        color?.trim() || null,
        dateLost,
      ]
    );

    const lostItemId = result.insertId;

    // If image provided, insert into item_image table
    if (imageUrl && imageUrl.trim()) {
      await execute(
        `INSERT INTO item_image (lost_item_id, image_url) VALUES (?, ?)`,
        [lostItemId, imageUrl.trim()]
      );
    }

    // Trigger Rule-Based Matching Algorithm
    const matches = await matchLostItemAgainstFound(lostItemId, session.userId);

    return NextResponse.json({
      success: true,
      item: {
        lost_item_id: lostItemId,
        item_name: itemName.trim(),
        status: 'Lost',
      },
      matchesFound: matches.length,
      message:
        matches.length > 0
          ? `Report saved! We found ${matches.length} potential match(es) with existing found items.`
          : 'Lost item successfully reported and published.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error reporting lost item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
