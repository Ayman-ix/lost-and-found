import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'user') {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await query<any>(
      `SELECT notification_id, message, notification_date, status
       FROM notification
       WHERE user_id = ?
       ORDER BY notification_date DESC`,
      [session.userId]
    );

    return NextResponse.json({ notifications });
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

    await execute(
      `UPDATE notification SET status = 'Read' WHERE user_id = ? AND status = 'Unread'`,
      [session.userId]
    );

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating notifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
