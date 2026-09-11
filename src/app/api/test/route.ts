import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/test
// Tests the MySQL database connection
export async function GET() {
  try {
    const categories = await query('SELECT * FROM category ORDER BY category_id');

    return NextResponse.json({
      success: true,
      engine: 'MySQL',
      message: 'MySQL database connection successful!',
      categories,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database connection error';
    return NextResponse.json(
      {
        success: false,
        engine: 'MySQL',
        error: message,
      },
      { status: 500 }
    );
  }
}
