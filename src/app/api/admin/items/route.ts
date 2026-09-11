import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [lostRows, foundRows] = await Promise.all([
      query<any>(`
        SELECT 
          l.lost_item_id AS id,
          'lost' AS type,
          l.item_name AS name,
          l.brand,
          l.color,
          l.date_lost AS date,
          l.status,
          l.created_at,
          u.user_id,
          u.name AS user_name,
          u.email AS user_email,
          c.category_name AS category,
          loc.location_name AS location
        FROM lost_item l
        LEFT JOIN \`user\` u ON l.user_id = u.user_id
        LEFT JOIN category c ON l.category_id = c.category_id
        LEFT JOIN location loc ON l.location_id = loc.location_id
        ORDER BY l.created_at DESC
      `),
      query<any>(`
        SELECT 
          f.found_item_id AS id,
          'found' AS type,
          f.item_name AS name,
          f.brand,
          f.color,
          f.date_found AS date,
          f.status,
          f.created_at,
          u.user_id,
          u.name AS user_name,
          u.email AS user_email,
          c.category_name AS category,
          loc.location_name AS location
        FROM found_item f
        LEFT JOIN \`user\` u ON f.user_id = u.user_id
        LEFT JOIN category c ON f.category_id = c.category_id
        LEFT JOIN location loc ON f.location_id = loc.location_id
        ORDER BY f.created_at DESC
      `),
    ]);

    const lostItems = lostRows.map((i) => ({
      id: i.id,
      type: 'lost' as const,
      name: i.name,
      brand: i.brand,
      color: i.color,
      date: i.date,
      status: i.status,
      user: {
        user_id: i.user_id,
        name: i.user_name,
        email: i.user_email,
      },
      category: i.category,
      location: i.location,
    }));

    const foundItems = foundRows.map((i) => ({
      id: i.id,
      type: 'found' as const,
      name: i.name,
      brand: i.brand,
      color: i.color,
      date: i.date,
      status: i.status,
      user: {
        user_id: i.user_id,
        name: i.user_name,
        email: i.user_email,
      },
      category: i.category,
      location: i.location,
    }));

    return NextResponse.json({
      lostItems,
      foundItems,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching admin items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Update item status
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, type, status } = body;

    if (!id || !type || !status) {
      return NextResponse.json({ error: 'Missing id, type, or status' }, { status: 400 });
    }

    if (type === 'lost') {
      await execute('UPDATE lost_item SET status = ? WHERE lost_item_id = ?', [status, id]);
    } else {
      await execute('UPDATE found_item SET status = ? WHERE found_item_id = ?', [status, id]);
    }

    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating item status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
