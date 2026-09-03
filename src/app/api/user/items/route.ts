import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
          category:category(category_name),
          location:location(location_name),
          images:item_image(image_url)
        `)
        .eq('user_id', session.userId)
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
          category:category(category_name),
          location:location(location_name),
          images:item_image(image_url)
        `)
        .eq('user_id', session.userId)
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
      category: (i.category as any)?.category_name,
      location: (i.location as any)?.location_name,
      imageUrl: i.images?.[0]?.image_url || null,
    }));

    const foundItems = (foundRes.data || []).map((i) => ({
      id: i.found_item_id,
      type: 'found' as const,
      name: i.item_name,
      brand: i.brand,
      color: i.color,
      date: i.date_found,
      status: i.status,
      category: (i.category as any)?.category_name,
      location: (i.location as any)?.location_name,
      imageUrl: i.images?.[0]?.image_url || null,
    }));

    return NextResponse.json({
      lostItems,
      foundItems,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading user items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
