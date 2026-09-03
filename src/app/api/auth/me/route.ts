import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  // If regular user, get unread notifications count
  let unreadCount = 0;
  if (session.role === 'user') {
    const { count } = await supabaseAdmin
      .from('notification')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.userId)
      .eq('status', 'Unread');
    unreadCount = count || 0;
  }

  return NextResponse.json({
    user: session,
    unreadNotifications: unreadCount,
  });
}
