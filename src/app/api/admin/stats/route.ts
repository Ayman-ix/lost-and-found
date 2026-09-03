import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
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
      supabaseAdmin.from('user').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('lost_item').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('found_item').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('claim').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabaseAdmin.from('potential_match').select('*', { count: 'exact', head: true }).eq('match_status', 'Pending'),
      supabaseAdmin.from('verification').select('*', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      totalUsers: usersCount.count || 0,
      totalLost: lostCount.count || 0,
      totalFound: foundCount.count || 0,
      pendingClaims: pendingClaimsCount.count || 0,
      pendingMatches: pendingMatchesCount.count || 0,
      totalVerifications: verificationsCount.count || 0,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving admin stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
