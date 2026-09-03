import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-server';
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

    // Check if email is already registered in "user" table
    const { data: existingUser } = await supabaseAdmin
      .from('user')
      .select('user_id')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into PostgreSQL "user" table
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('user')
      .insert([
        {
          name: name.trim(),
          email: trimmedEmail,
          phone: phone ? phone.trim() : null,
          password: hashedPassword,
        },
      ])
      .select('user_id, name, email, phone, created_at')
      .single();

    if (insertError || !newUser) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to register user.' },
        { status: 500 }
      );
    }

    // Create a welcome notification
    await supabaseAdmin.from('notification').insert([
      {
        user_id: newUser.user_id,
        message: `Welcome to the Lost & Found Network, ${newUser.name}! You can now report lost or found items and submit claims.`,
        status: 'Unread',
      },
    ]);

    // Issue JWT session
    const sessionToken = await createSession({
      userId: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      role: 'user',
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      user: {
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: 'user',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
