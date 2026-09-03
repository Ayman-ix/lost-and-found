import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [lostRes, foundRes] = await Promise.all([
      supabaseAdmin
        .from('lost_item')
        .select(`
          lost_item_id,
          item_name,
          brand,
          color,
          date_lost,
          status,
          created_at,
          user:user(user_id, name, email),
          category:category(category_name),
          location:location(location_name)
        `)
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('found_item')
        .select(`
          found_item_id,
          item_name,
          brand,
          color,
          date_found,
          status,
          created_at,
          user:user(user_id, name, email),
          category:category(category_name),
          location:location(location_name)
        `)
        .order('created_at', { ascending: false }),
    ]);

    const lostItems = (lostRes.data || []).map((i) => ({
      id: i.lost_item_id,
      type: 'lost' as const,
      name: i.item_name,
      brand: i.brand,
      color: i.color,
      date: i.date_lost,
      status: i.status,
      user: i.user,
      category: (i.category as any)?.category_name,
      location: (i.location as any)?.location_name,
    }));

    const foundItems = (foundRes.data || []).map((i) => ({
      id: i.found_item_id,
      type: 'found' as const,
      name: i.item_name,
      brand: i.brand,
      color: i.color,
      date: i.date_found,
      status: i.status,
      user: i.user,
      category: (i.category as any)?.category_name,
      location: (i.location as any)?.location_name,
    }));

    return NextResponse.json({
      lostItems,
      foundItems,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching admin items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Update item status
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, type, status } = body;

    if (!id || !type || !status) {
      return NextResponse.json({ error: 'Missing id, type, or status' }, { status: 400 });
    }

    const table = type === 'lost' ? 'lost_item' : 'found_item';
    const idField = type === 'lost' ? 'lost_item_id' : 'found_item_id';

    const { error } = await supabaseAdmin
      .from(table)
      .update({ status })
      .eq(idField, id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Status updated to ${status}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error updating item status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
