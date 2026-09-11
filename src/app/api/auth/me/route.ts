import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { queryOne } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  let unreadCount = 0;
  if (session.role === 'user') {
    const result = await queryOne<any>(
      `SELECT COUNT(*) as unreadCount 
       FROM notification 
       WHERE user_id = ? AND status = 'Unread'`,
      [session.userId]
    );
    unreadCount = Number(result?.unreadCount || 0);
  }

  return NextResponse.json({
    user: session,
    unreadNotifications: unreadCount,
  });
}
