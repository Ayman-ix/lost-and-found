import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('location')
    .select('location_id, location_name, city')
    .order('location_name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ locations: data || [] });
}
