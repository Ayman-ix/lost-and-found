import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

// GET /api/claims
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabaseAdmin
      .from('claim')
      .select(`
        claim_id,
        claim_date,
        proof,
        status,
        user:user(user_id, name, email, phone),
        found_item:found_item(
          found_item_id,
          item_name,
          brand,
          color,
          date_found,
          category:category(category_name),
          location:location(location_name)
        ),
        verification:verification(
          verification_id,
          verification_date,
          remarks,
          status,
          admin:admin(name, email)
        )
      `)
      .order('claim_date', { ascending: false });

    // If regular user, only view own claims
    if (session.role === 'user') {
      query = query.eq('user_id', session.userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ claims: data || [] });
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
    const { data: foundItem, error: itemErr } = await supabaseAdmin
      .from('found_item')
      .select('found_item_id, item_name, user_id')
      .eq('found_item_id', foundItemId)
      .single();

    if (itemErr || !foundItem) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 });
    }

    // Prevent claimant from claiming their own reported item
    if (foundItem.user_id === session.userId) {
      return NextResponse.json(
        { error: 'You cannot claim an item you reported yourself as found.' },
        { status: 400 }
      );
    }

    // Check if user already submitted a claim for this found item
    const { data: existingClaim } = await supabaseAdmin
      .from('claim')
      .select('claim_id')
      .eq('user_id', session.userId)
      .eq('found_item_id', foundItemId)
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already submitted a claim for this item. Please wait for admin review.' },
        { status: 409 }
      );
    }

    // Insert into CLAIM table
    const { data: newClaim, error: claimErr } = await supabaseAdmin
      .from('claim')
      .insert([
        {
          user_id: session.userId,
          found_item_id: foundItemId,
          proof: proof.trim(),
          status: 'Pending',
        },
      ])
      .select()
      .single();

    if (claimErr || !newClaim) {
      return NextResponse.json(
        { error: claimErr?.message || 'Failed to submit claim' },
        { status: 500 }
      );
    }

    // Create notification for claimant
    await supabaseAdmin.from('notification').insert([
      {
        user_id: session.userId,
        message: `Your ownership claim for "${foundItem.item_name}" was submitted. Current status: Pending admin verification.`,
        status: 'Unread',
      },
    ]);

    return NextResponse.json({
      success: true,
      claim: newClaim,
      message: 'Claim successfully submitted. An administrator will review your proof.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error submitting claim';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
