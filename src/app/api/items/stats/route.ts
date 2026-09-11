import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
    const totalLostRow = await queryOne<any>('SELECT COUNT(*) as count FROM lost_item');
    const totalFoundRow = await queryOne<any>('SELECT COUNT(*) as count FROM found_item');
    const returnedLostRow = await queryOne<any>("SELECT COUNT(*) as count FROM lost_item WHERE status = 'Returned'");
    const returnedFoundRow = await queryOne<any>("SELECT COUNT(*) as count FROM found_item WHERE status = 'Returned'");
    const verifiedClaimsRow = await queryOne<any>("SELECT COUNT(*) as count FROM verification WHERE status = 'Approved'");

    const totalLost = Number(totalLostRow?.count || 0);
    const totalFound = Number(totalFoundRow?.count || 0);
    const returnedLost = Number(returnedLostRow?.count || 0);
    const returnedFound = Number(returnedFoundRow?.count || 0);
    const verifiedClaims = Number(verifiedClaimsRow?.count || 0);

    return NextResponse.json({
      totalLost,
      totalFound,
      totalResolved: returnedLost + returnedFound + verifiedClaims,
      totalItems: totalLost + totalFound,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
