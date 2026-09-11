import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const rows = await query<any>(`
      SELECT 
        v.verification_id,
        v.verification_date,
        v.remarks,
        v.status AS verification_status,
        a.admin_id,
        a.name AS admin_name,
        a.email AS admin_email,
        c.claim_id,
        c.claim_date,
        c.proof,
        c.status AS claim_status,
        u.name AS user_name,
        u.email AS user_email,
        f.found_item_id,
        f.item_name AS found_item_name,
        cat.category_name
      FROM verification v
      JOIN \`admin\` a ON v.admin_id = a.admin_id
      JOIN claim c ON v.claim_id = c.claim_id
      JOIN \`user\` u ON c.user_id = u.user_id
      JOIN found_item f ON c.found_item_id = f.found_item_id
      LEFT JOIN category cat ON f.category_id = cat.category_id
      ORDER BY v.verification_date DESC
    `);

    const verifications = rows.map((r) => ({
      verification_id: r.verification_id,
      verification_date: r.verification_date,
      remarks: r.remarks,
      status: r.verification_status,
      admin: {
        admin_id: r.admin_id,
        name: r.admin_name,
        email: r.admin_email,
      },
      claim: {
        claim_id: r.claim_id,
        claim_date: r.claim_date,
        proof: r.proof,
        status: r.claim_status,
        user: {
          name: r.user_name,
          email: r.user_email,
        },
        found_item: {
          found_item_id: r.found_item_id,
          item_name: r.found_item_name,
          category: {
            category_name: r.category_name,
          },
        },
      },
    }));

    return NextResponse.json({ verifications });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error retrieving verifications';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
