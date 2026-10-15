import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role = 'user' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. ADMIN AUTHENTICATION
    if (role === 'admin') {
      const adminRecord = await queryOne<any>(
        'SELECT admin_id, name, email, password FROM `admin` WHERE email = ?',
        [trimmedEmail]
      );



      if (!adminRecord) {
        return NextResponse.json(
          { error: 'Invalid admin email or password.' },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(password, adminRecord.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid admin email or password.' },
          { status: 401 }
        );
      }

      const sessionToken = await createSession({
        userId: adminRecord.admin_id,
        name: adminRecord.name,
        email: adminRecord.email,
        role: 'admin',
      });
      await setSessionCookie(sessionToken);

      return NextResponse.json({
        success: true,
        user: {
          userId: adminRecord.admin_id,
          name: adminRecord.name,
          email: adminRecord.email,
          role: 'admin',
        },
      });
    }

    // 2. REGULAR USER AUTHENTICATION
    const userRecord = await queryOne<any>(
      'SELECT user_id, name, email, password FROM `user` WHERE email = ?',
      [trimmedEmail]
    );

    if (!userRecord) {
      return NextResponse.json(
        { error: 'No account found with this email.' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const sessionToken = await createSession({
      userId: userRecord.user_id,
      name: userRecord.name,
      email: userRecord.email,
      role: 'user',
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      user: {
        userId: userRecord.user_id,
        name: userRecord.name,
        email: userRecord.email,
        role: 'user',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
