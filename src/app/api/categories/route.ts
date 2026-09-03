import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('category')
    .select('category_id, category_name')
    .order('category_id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data || [] });
}
