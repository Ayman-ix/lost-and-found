import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';
import { matchLostItemAgainstFound } from '@/lib/matcher';

// GET /api/items/lost (Browse lost items with search & filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('q');
    const status = searchParams.get('status');

    let query = supabaseAdmin
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
        user:user(user_id, name, email),
        category:category(category_id, category_name),
        location:location(location_id, location_name, city),
        images:item_image(image_id, image_url)
      `)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category_id', category);
    }
    if (location) {
      query = query.eq('location_id', location);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`item_name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%,color.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve lost items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/items/lost (Report a lost item)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to report a lost item.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      itemName,
      categoryId,
      locationId,
      description,
      brand,
      color,
      dateLost,
      imageUrl,
    } = body;

    // Validate required fields
    if (!itemName || !categoryId || !locationId || !dateLost) {
      return NextResponse.json(
        { error: 'Item name, category, location, and date lost are required.' },
        { status: 400 }
      );
    }

    // Insert into lost_item
    const { data: lostItem, error: insertError } = await supabaseAdmin
      .from('lost_item')
      .insert([
        {
          user_id: session.userId,
          category_id: Number(categoryId),
          location_id: Number(locationId),
          item_name: itemName.trim(),
          description: description?.trim() || null,
          brand: brand?.trim() || null,
          color: color?.trim() || null,
          date_lost: dateLost,
          status: 'Lost',
        },
      ])
      .select()
      .single();

    if (insertError || !lostItem) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to record lost item' },
        { status: 500 }
      );
    }

    // If image provided, insert normalized record into item_image table
    if (imageUrl && imageUrl.trim()) {
      await supabaseAdmin.from('item_image').insert([
        {
          lost_item_id: lostItem.lost_item_id,
          image_url: imageUrl.trim(),
        },
      ]);
    }

    // Trigger Rule-Based Matching Algorithm
    const matches = await matchLostItemAgainstFound(lostItem.lost_item_id, session.userId);

    return NextResponse.json({
      success: true,
      item: lostItem,
      matchesFound: matches.length,
      message:
        matches.length > 0
          ? `Report saved! We found ${matches.length} potential match(es) with existing found items.`
          : 'Lost item successfully reported and published.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error reporting lost item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
