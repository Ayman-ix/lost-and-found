import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('potential_match')
      .select(`
        match_id,
        match_score,
        match_status,
        created_at,
        lost_item:lost_item(
          lost_item_id,
          item_name,
          brand,
          color,
          date_lost,
          status,
          user:user(name, email)
        ),
        found_item:found_item(
          found_item_id,
          item_name,
          brand,
          color,
          date_found,
          status,
          user:user(name, email)
        )
      `)
      .order('match_score', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches: data || [] });
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

    const { error } = await supabaseAdmin
      .from('potential_match')
      .update({ match_status: status })
      .eq('match_id', matchId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Match updated to ${status}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating match';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
