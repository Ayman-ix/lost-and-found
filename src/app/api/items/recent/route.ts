import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  try {
    // 1. Fetch recent lost items (with category & location)
    const { data: lostItems, error: lostErr } = await supabaseAdmin
      .from('lost_item')
      .select(`
        lost_item_id,
        item_name,
        description,
        brand,
        color,
        date_lost,
        status,
        created_at,
        category:category(category_name),
        location:location(location_name, city),
        images:item_image(image_url)
      `)
      .order('created_at', { ascending: false })
      .limit(4);

    // 2. Fetch recent found items (with category & location)
    const { data: foundItems, error: foundErr } = await supabaseAdmin
      .from('found_item')
      .select(`
        found_item_id,
        item_name,
        description,
        brand,
        color,
        date_found,
        status,
        created_at,
        category:category(category_name),
        location:location(location_name, city),
        images:item_image(image_url)
      `)
      .order('created_at', { ascending: false })
      .limit(4);

    if (lostErr || foundErr) {
      return NextResponse.json(
        { error: lostErr?.message || foundErr?.message },
        { status: 500 }
      );
    }

    const formattedLost = (lostItems || []).map((item) => ({
      id: item.lost_item_id,
      type: 'lost' as const,
      name: item.item_name,
      description: item.description,
      brand: item.brand,
      color: item.color,
      date: item.date_lost,
      status: item.status,
      createdAt: item.created_at,
      category: (item.category as unknown as { category_name: string })?.category_name || 'General',
      location: (item.location as unknown as { location_name: string; city: string })?.location_name || 'Campus',
      imageUrl: item.images && item.images.length > 0 ? item.images[0].image_url : null,
    }));

    const formattedFound = (foundItems || []).map((item) => ({
      id: item.found_item_id,
      type: 'found' as const,
      name: item.item_name,
      description: item.description,
      brand: item.brand,
      color: item.color,
      date: item.date_found,
      status: item.status,
      createdAt: item.created_at,
      category: (item.category as unknown as { category_name: string })?.category_name || 'General',
      location: (item.location as unknown as { location_name: string; city: string })?.location_name || 'Campus',
      imageUrl: item.images && item.images.length > 0 ? item.images[0].image_url : null,
    }));

    return NextResponse.json({
      recentLost: formattedLost,
      recentFound: formattedFound,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching recent items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
