import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '@/lib/db';
import { createSession, setSessionCookie } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if email is already registered in MySQL "user" table
    const existingUser = await queryOne<any>(
      'SELECT user_id FROM `user` WHERE email = ?',
      [trimmedEmail]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into MySQL "user" table
    const result = await execute(
      'INSERT INTO `user` (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name.trim(), trimmedEmail, phone ? phone.trim() : null, hashedPassword]
    );

    const newUserId = result.insertId;

    // Create a welcome notification
    await execute(
      'INSERT INTO `notification` (user_id, message, status) VALUES (?, ?, ?)',
      [
        newUserId,
        `Welcome to the Lost & Found Network, ${name.trim()}! You can now report lost or found items and submit claims.`,
        'Unread',
      ]
    );

    // Issue JWT session
    const sessionToken = await createSession({
      userId: newUserId,
      name: name.trim(),
      email: trimmedEmail,
      role: 'user',
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      user: {
        userId: newUserId,
        name: name.trim(),
        email: trimmedEmail,
        role: 'user',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
