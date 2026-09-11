import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await query<any>(
      `SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        (SELECT COUNT(*) FROM lost_item WHERE user_id = u.user_id) AS lostCount,
        (SELECT COUNT(*) FROM found_item WHERE user_id = u.user_id) AS foundCount,
        (SELECT COUNT(*) FROM claim WHERE user_id = u.user_id) AS claimsCount
      FROM \`user\` u
      ORDER BY u.user_id ASC`
    );

    const formatted = users.map((u) => ({
      ...u,
      lostCount: Number(u.lostCount || 0),
      foundCount: Number(u.foundCount || 0),
      claimsCount: Number(u.claimsCount || 0),
    }));

    return NextResponse.json({ users: formatted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching users';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
