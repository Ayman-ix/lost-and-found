import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// GET /api/test
// Tests the database connection by fetching all categories
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('category')
    .select('*')
    .order('category_id');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Database connection successful!',
    categories: data,
  });
}
