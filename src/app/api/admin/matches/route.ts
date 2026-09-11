import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rows = await query<any>(`
      SELECT 
        m.match_id,
        m.match_score,
        m.match_status,
        m.created_at,
        l.lost_item_id,
        l.item_name AS lost_name,
        l.brand AS lost_brand,
        l.color AS lost_color,
        l.date_lost,
        l.status AS lost_status,
        lu.name AS lost_user_name,
        lu.email AS lost_user_email,
        f.found_item_id,
        f.item_name AS found_name,
        f.brand AS found_brand,
        f.color AS found_color,
        f.date_found,
        f.status AS found_status,
        fu.name AS found_user_name,
        fu.email AS found_user_email
      FROM potential_match m
      JOIN lost_item l ON m.lost_item_id = l.lost_item_id
      LEFT JOIN \`user\` lu ON l.user_id = lu.user_id
      JOIN found_item f ON m.found_item_id = f.found_item_id
      LEFT JOIN \`user\` fu ON f.user_id = fu.user_id
      ORDER BY m.match_score DESC
    `);

    const matches = rows.map((r) => ({
      match_id: r.match_id,
      match_score: r.match_score,
      match_status: r.match_status,
      created_at: r.created_at,
      lost_item: {
        lost_item_id: r.lost_item_id,
        item_name: r.lost_name,
        brand: r.lost_brand,
        color: r.lost_color,
        date_lost: r.date_lost,
        status: r.lost_status,
        user: {
          name: r.lost_user_name,
          email: r.lost_user_email,
        },
      },
      found_item: {
        found_item_id: r.found_item_id,
        item_name: r.found_name,
        brand: r.found_brand,
        color: r.found_color,
        date_found: r.date_found,
        status: r.found_status,
        user: {
          name: r.found_user_name,
          email: r.found_user_email,
        },
      },
    }));

    return NextResponse.json({ matches });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching matches';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Update match status (e.g. Confirmed or Rejected)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { matchId, status } = body;

    if (!matchId || !status || !['Pending', 'Possible', 'Confirmed', 'Rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid matchId or status' }, { status: 400 });
    }

    await execute(
      'UPDATE potential_match SET match_status = ? WHERE match_id = ?',
      [status, matchId]
    );

    return NextResponse.json({ success: true, message: `Match updated to ${status}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating match';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
