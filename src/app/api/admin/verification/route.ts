import { NextResponse } from 'next/server';
import { queryOne, withTransaction } from '@/lib/db';
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

    const itemName = claim.item_name || 'claimed item';

    // Execute atomic transaction for all state mutations
    await withTransaction(async (conn) => {
      // 2. Insert or update VERIFICATION table (1:1 with claim)
      await conn.execute(
        `INSERT INTO verification (claim_id, admin_id, remarks, status, verification_date)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
           admin_id = VALUES(admin_id),
           remarks = VALUES(remarks),
           status = VALUES(status),
           verification_date = NOW()`,
        [claimId, session.userId, remarks?.trim() || null, status]
      );

      // 3. Update primary CLAIM status
      await conn.execute('UPDATE claim SET status = ? WHERE claim_id = ?', [status, claimId]);

      if (status === 'Approved') {
        // 4. Update FOUND_ITEM status to 'Claimed'
        await conn.execute("UPDATE found_item SET status = 'Claimed' WHERE found_item_id = ?", [
          claim.found_item_id,
        ]);

        // 5. Automatically reject any other pending claims on the same found item
        const [competingClaims]: any = await conn.execute(
          `SELECT claim_id, user_id FROM claim 
           WHERE found_item_id = ? AND claim_id != ? AND status = 'Pending'`,
          [claim.found_item_id, claimId]
        );

        if (competingClaims && competingClaims.length > 0) {
          await conn.execute(
            `UPDATE claim SET status = 'Rejected' 
             WHERE found_item_id = ? AND claim_id != ? AND status = 'Pending'`,
            [claim.found_item_id, claimId]
          );

          for (const other of competingClaims) {
            await conn.execute(
              `INSERT INTO notification (user_id, message, status) VALUES (?, ?, 'Unread')`,
              [
                other.user_id,
                `Your claim for "${itemName}" was rejected because another claimant's ownership proof was verified and approved.`,
              ]
            );
          }
        }

        // 6. Notify the approved claimant
        await conn.execute(
          `INSERT INTO notification (user_id, message, status) VALUES (?, ?, 'Unread')`,
          [
            claim.user_id,
            `Congratulations! Your claim for "${itemName}" has been APPROVED. Remarks: ${
              remarks || 'Verified by admin.'
            } Please visit the campus recovery office with valid student/faculty ID.`,
          ]
        );
      } else {
        // Notify the rejected claimant
        await conn.execute(
          `INSERT INTO notification (user_id, message, status) VALUES (?, ?, 'Unread')`,
          [
            claim.user_id,
            `Your claim for "${itemName}" was reviewed and REJECTED. Remarks: ${
              remarks || 'Insufficient proof provided.'
            }`,
          ]
        );
      }
    });

    return NextResponse.json({
      success: true,
      message: `Claim #${claimId} has been successfully ${status.toLowerCase()}.`,
    });
  } catch (err: unknown) {
    console.error('Error processing admin verification:', err);
    return NextResponse.json(
      { error: 'An unexpected database error occurred while processing verification.' },
      { status: 500 }
    );
  }
}
