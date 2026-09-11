import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = await query(
      'SELECT category_id, category_name, description FROM category ORDER BY category_id'
    );
    return NextResponse.json({ categories });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
