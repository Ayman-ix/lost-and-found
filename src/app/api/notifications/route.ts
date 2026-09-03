import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ notifications: [] });
    }

    const { data, error } = await supabaseAdmin
      .from('notification')
      .select('notification_id, message, notification_date, status')
      .eq('user_id', session.userId)
      .order('notification_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Mark all as read
export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await supabaseAdmin
      .from('notification')
      .update({ status: 'Read' })
      .eq('user_id', session.userId)
      .eq('status', 'Unread');

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
