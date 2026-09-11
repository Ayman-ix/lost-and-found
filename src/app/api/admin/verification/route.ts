import { NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { claimId, status, remarks } = body;

    if (!claimId || !status || !['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid claim ID and status (Approved or Rejected) are required.' },
        { status: 400 }
      );
    }

    // 1. Fetch the claim details
    const claim = await queryOne<any>(
      `SELECT c.claim_id, c.user_id, c.found_item_id, c.status, f.item_name
       FROM claim c
       JOIN found_item f ON c.found_item_id = f.found_item_id
       WHERE c.claim_id = ?`,
      [claimId]
    );

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // 2. Insert or update VERIFICATION table (1:1 with claim)
    await execute(
      `INSERT INTO verification (claim_id, admin_id, remarks, status, verification_date)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
         admin_id = VALUES(admin_id),
         remarks = VALUES(remarks),
         status = VALUES(status),
         verification_date = NOW()`,
      [claimId, session.userId, remarks?.trim() || null, status]
    );

    // 3. Update CLAIM status
    await execute('UPDATE claim SET status = ? WHERE claim_id = ?', [status, claimId]);

    // 4. If approved, update FOUND_ITEM status to 'Returned'
    if (status === 'Approved') {
      await execute("UPDATE found_item SET status = 'Returned' WHERE found_item_id = ?", [
        claim.found_item_id,
      ]);
    }

    // 5. Notify the claimant
    const itemName = claim.item_name || 'claimed item';
    const notifMessage =
      status === 'Approved'
        ? `Congratulations! Your ownership claim for "${itemName}" has been APPROVED. Remarks: ${
            remarks || 'Verified by admin.'
          } Please visit the campus recovery office to retrieve your item.`
        : `Your claim for "${itemName}" was reviewed and REJECTED. Remarks: ${
            remarks || 'Insufficient proof provided.'
          }`;

    await execute(
      'INSERT INTO notification (user_id, message, status) VALUES (?, ?, ?)',
      [claim.user_id, notifMessage, 'Unread']
    );

    return NextResponse.json({
      success: true,
      message: `Claim #${claimId} has been successfully ${status.toLowerCase()}.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing verification';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
