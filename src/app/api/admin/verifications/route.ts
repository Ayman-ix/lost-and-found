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
      .from('verification')
      .select(`
        verification_id,
        verification_date,
        remarks,
        status,
        admin:admin(admin_id, name, email),
        claim:claim(
          claim_id,
          claim_date,
          proof,
          status,
          user:user(name, email),
          found_item:found_item(found_item_id, item_name, category:category(category_name))
        )
      `)
      .order('verification_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ verifications: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving verifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
