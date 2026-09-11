import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const locations = await query(
      'SELECT location_id, location_name, city, address FROM location ORDER BY location_name'
    );
    return NextResponse.json({ locations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching locations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
