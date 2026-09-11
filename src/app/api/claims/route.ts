import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';

// GET /api/claims
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sql = `
      SELECT 
        c.claim_id,
        c.claim_date,
        c.proof,
        c.status AS claim_status,
        u.user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.phone AS user_phone,
        f.found_item_id,
        f.item_name AS found_item_name,
        f.brand AS found_brand,
        f.color AS found_color,
        f.date_found,
        cat.category_name,
        loc.location_name,
        v.verification_id,
        v.verification_date,
        v.remarks,
        v.status AS verification_status,
        adm.name AS admin_name,
        adm.email AS admin_email
      FROM claim c
      JOIN \`user\` u ON c.user_id = u.user_id
      JOIN found_item f ON c.found_item_id = f.found_item_id
      LEFT JOIN category cat ON f.category_id = cat.category_id
      LEFT JOIN location loc ON f.location_id = loc.location_id
      LEFT JOIN verification v ON c.claim_id = v.claim_id
      LEFT JOIN \`admin\` adm ON v.admin_id = adm.admin_id
    `;

    const params: any[] = [];
    if (session.role === 'user') {
      sql += ` WHERE c.user_id = ?`;
      params.push(session.userId);
    }

    sql += ` ORDER BY c.claim_date DESC`;

    const rows = await query<any>(sql, params);

    const claims = rows.map((row) => ({
      claim_id: row.claim_id,
      claim_date: row.claim_date,
      proof: row.proof,
      status: row.claim_status,
      user: {
        user_id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        phone: row.user_phone,
      },
      found_item: {
        found_item_id: row.found_item_id,
        item_name: row.found_item_name,
        brand: row.found_brand,
        color: row.found_color,
        date_found: row.date_found,
        category: { category_name: row.category_name },
        location: { location_name: row.location_name },
      },
      verification: row.verification_id
        ? {
            verification_id: row.verification_id,
            verification_date: row.verification_date,
            remarks: row.remarks,
            status: row.verification_status,
            admin: {
              name: row.admin_name,
              email: row.admin_email,
            },
          }
        : null,
    }));

    return NextResponse.json({ claims });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching claims';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/claims (Submit a claim for a found item)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to submit a claim.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { foundItemId, proof } = body;

    if (!foundItemId || !proof || !proof.trim()) {
      return NextResponse.json(
        { error: 'Found item ID and proof of ownership are required.' },
        { status: 400 }
      );
    }

    // Verify found item exists
    const foundItem = await queryOne<any>(
      `SELECT found_item_id, item_name, user_id, status FROM found_item WHERE found_item_id = ?`,
      [Number(foundItemId)]
    );

    if (!foundItem) {
      return NextResponse.json({ error: 'Found item not found.' }, { status: 404 });
    }

    // Prevent user from claiming an item they reported as found
    if (foundItem.user_id === session.userId) {
      return NextResponse.json(
        { error: 'You cannot submit a claim for an item you reported as found.' },
        { status: 400 }
      );
    }

    // Check if user already submitted a pending claim
    const existingClaim = await queryOne<any>(
      `SELECT claim_id FROM claim WHERE found_item_id = ? AND user_id = ? AND status = 'Pending'`,
      [Number(foundItemId), session.userId]
    );

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim submitted for this item.' },
        { status: 409 }
      );
    }

    // Insert new claim
    const result = await execute(
      `INSERT INTO claim (found_item_id, user_id, proof, status) VALUES (?, ?, ?, 'Pending')`,
      [Number(foundItemId), session.userId, proof.trim()]
    );

    const newClaimId = result.insertId;

    // Notify the user who reported the found item
    if (foundItem.user_id) {
      await execute(
        `INSERT INTO notification (user_id, message, status) VALUES (?, ?, 'Unread')`,
        [
          foundItem.user_id,
          `A new ownership claim has been submitted for your found item "${foundItem.item_name}". An administrator will verify it shortly.`,
        ]
      );
    }

    return NextResponse.json({
      success: true,
      claim: {
        claim_id: newClaimId,
        found_item_id: Number(foundItemId),
        status: 'Pending',
      },
      message: 'Claim submitted successfully. A campus administrator will review your proof.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error submitting claim';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
