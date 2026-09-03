import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    // Total lost items
    const { count: totalLost } = await supabaseAdmin
      .from('lost_item')
      .select('*', { count: 'exact', head: true });

    // Total found items
    const { count: totalFound } = await supabaseAdmin
      .from('found_item')
      .select('*', { count: 'exact', head: true });

    // Resolved / Returned items
    const { count: returnedLost } = await supabaseAdmin
      .from('lost_item')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Returned');

    const { count: returnedFound } = await supabaseAdmin
      .from('found_item')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Returned');

    // Total verified claims
    const { count: verifiedClaims } = await supabaseAdmin
      .from('verification')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Approved');

    return NextResponse.json({
      totalLost: totalLost || 0,
      totalFound: totalFound || 0,
      totalResolved: (returnedLost || 0) + (returnedFound || 0) + (verifiedClaims || 0),
      totalItems: (totalLost || 0) + (totalFound || 0),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
