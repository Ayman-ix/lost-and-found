import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: users, error: userErr } = await supabaseAdmin
      .from('user')
      .select('user_id, name, email, phone, created_at')
      .order('user_id', { ascending: true });

    if (userErr) {
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }

    // Get counts for each user
    const formatted = await Promise.all(
      (users || []).map(async (u) => {
        const [lost, found, claims] = await Promise.all([
          supabaseAdmin
            .from('lost_item')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.user_id),
          supabaseAdmin
            .from('found_item')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.user_id),
          supabaseAdmin
            .from('claim')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', u.user_id),
        ]);

        return {
          ...u,
          lostCount: lost.count || 0,
          foundCount: found.count || 0,
          claimsCount: claims.count || 0,
        };
      })
    );

    return NextResponse.json({ users: formatted });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching users';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
