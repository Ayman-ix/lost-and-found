import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase-server';
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
      // Check if admin table has any records; if completely empty, seed the default admin
      const { count } = await supabaseAdmin
        .from('admin')
        .select('*', { count: 'exact', head: true });

      if (count === 0 && trimmedEmail === 'admin@campus.edu' && password === 'admin123') {
        const defaultHashed = await bcrypt.hash('admin123', 10);
        const { data: seededAdmin } = await supabaseAdmin
          .from('admin')
          .insert([
            {
              name: 'Campus Administrator',
              email: 'admin@campus.edu',
              password: defaultHashed,
            },
          ])
          .select('admin_id, name, email')
          .single();

        if (seededAdmin) {
          const sessionToken = await createSession({
            userId: seededAdmin.admin_id,
            name: seededAdmin.name,
            email: seededAdmin.email,
            role: 'admin',
          });
          await setSessionCookie(sessionToken);

          return NextResponse.json({
            success: true,
            user: {
              userId: seededAdmin.admin_id,
              name: seededAdmin.name,
              email: seededAdmin.email,
              role: 'admin',
            },
          });
        }
      }

      // Query admin table
      const { data: adminRecord, error: adminErr } = await supabaseAdmin
        .from('admin')
        .select('admin_id, name, email, password')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (adminErr || !adminRecord) {
        return NextResponse.json(
          { error: 'Invalid admin email or password.' },
          { status: 401 }
        );
      }

      // Compare password
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
    const { data: userRecord, error: userErr } = await supabaseAdmin
      .from('user')
      .select('user_id, name, email, password')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (userErr || !userRecord) {
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
