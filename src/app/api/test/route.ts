import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/test - Lightweight health check for deployment verification
export async function GET() {
  try {
    await query('SELECT 1');
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
    });
  } catch (err) {
    console.error('Health check failed:', err);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Database service unavailable' },
      { status: 503 }
    );
  }
}
