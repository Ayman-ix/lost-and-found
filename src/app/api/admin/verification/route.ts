import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
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
    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claim')
      .select('claim_id, user_id, found_item_id, status, found_item:found_item(item_name)')
      .eq('claim_id', claimId)
      .single();

    if (claimErr || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // 2. Insert into VERIFICATION table (1:1 with claim)
    const { data: verification, error: verErr } = await supabaseAdmin
      .from('verification')
      .upsert(
        [
          {
            claim_id: claimId,
            admin_id: session.userId,
            remarks: remarks?.trim() || null,
            status,
            verification_date: new Date().toISOString(),
          },
        ],
        { onConflict: 'claim_id' }
      )
      .select()
      .single();

    if (verErr || !verification) {
      return NextResponse.json(
        { error: verErr?.message || 'Failed to record verification' },
        { status: 500 }
      );
    }

    // 3. Update CLAIM status
    await supabaseAdmin
      .from('claim')
      .update({ status })
      .eq('claim_id', claimId);

    // 4. If approved, update FOUND_ITEM status to 'Returned'
    if (status === 'Approved') {
      await supabaseAdmin
        .from('found_item')
        .update({ status: 'Returned' })
        .eq('found_item_id', claim.found_item_id);
    }

    // 5. Notify the claimant
    const itemName = (claim.found_item as any)?.item_name || 'claimed item';
    const notifMessage =
      status === 'Approved'
        ? `Congratulations! Your ownership claim for "${itemName}" has been APPROVED. Remarks: ${
            remarks || 'Verified by admin.'
          } Please visit the campus recovery office to retrieve your item.`
        : `Your claim for "${itemName}" was reviewed and REJECTED. Remarks: ${
            remarks || 'Insufficient proof provided.'
          }`;

    await supabaseAdmin.from('notification').insert([
      {
        user_id: claim.user_id,
        message: notifMessage,
        status: 'Unread',
      },
    ]);

    return NextResponse.json({
      success: true,
      verification,
      message: `Claim #${claimId} has been successfully ${status.toLowerCase()}.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error processing verification';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
