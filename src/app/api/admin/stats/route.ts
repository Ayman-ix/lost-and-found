import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const [
      usersCount,
      lostCount,
      foundCount,
      pendingClaimsCount,
      pendingMatchesCount,
      verificationsCount,
    ] = await Promise.all([
      queryOne<any>('SELECT COUNT(*) as count FROM `user`'),
      queryOne<any>('SELECT COUNT(*) as count FROM lost_item'),
      queryOne<any>('SELECT COUNT(*) as count FROM found_item'),
      queryOne<any>("SELECT COUNT(*) as count FROM claim WHERE status = 'Pending'"),
      queryOne<any>("SELECT COUNT(*) as count FROM potential_match WHERE match_status = 'Pending'"),
      queryOne<any>('SELECT COUNT(*) as count FROM verification'),
    ]);

    return NextResponse.json({
      totalUsers: Number(usersCount?.count || 0),
      totalLost: Number(lostCount?.count || 0),
      totalFound: Number(foundCount?.count || 0),
      pendingClaims: Number(pendingClaimsCount?.count || 0),
      pendingMatches: Number(pendingMatchesCount?.count || 0),
      totalVerifications: Number(verificationsCount?.count || 0),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving admin stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
