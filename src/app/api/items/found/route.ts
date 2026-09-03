import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getSession } from '@/lib/session';
import { matchFoundItemAgainstLost } from '@/lib/matcher';

// GET /api/items/found (Browse found items with search & filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const search = searchParams.get('q');
    const status = searchParams.get('status');

    let query = supabaseAdmin
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
    const msg = err instanceof Error ? err.message : 'Failed to retrieve found items';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/items/found (Report a found item)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'You must be signed in to report a found item.' },
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
      dateFound,
      imageUrl,
    } = body;

    // Validate required fields
    if (!itemName || !categoryId || !locationId || !dateFound) {
      return NextResponse.json(
        { error: 'Item name, category, location, and date found are required.' },
        { status: 400 }
      );
    }

    // Insert into found_item table
    const { data: foundItem, error: insertError } = await supabaseAdmin
      .from('found_item')
      .insert([
        {
          user_id: session.userId,
          category_id: Number(categoryId),
          location_id: Number(locationId),
          item_name: itemName.trim(),
          description: description?.trim() || null,
          brand: brand?.trim() || null,
          color: color?.trim() || null,
          date_found: dateFound,
          status: 'Found',
        },
      ])
      .select()
      .single();

    if (insertError || !foundItem) {
      return NextResponse.json(
        { error: insertError?.message || 'Failed to record found item' },
        { status: 500 }
      );
    }

    // If image provided, insert into item_image table
    if (imageUrl && imageUrl.trim()) {
      await supabaseAdmin.from('item_image').insert([
        {
          found_item_id: foundItem.found_item_id,
          image_url: imageUrl.trim(),
        },
      ]);
    }

    // Trigger Rule-Based Matching Algorithm
    const matches = await matchFoundItemAgainstLost(foundItem.found_item_id, session.userId);

    return NextResponse.json({
      success: true,
      item: foundItem,
      matchesFound: matches.length,
      message:
        matches.length > 0
          ? `Thank you for reporting! We found ${matches.length} lost item report(s) matching this item. Owners have been notified.`
          : 'Found item successfully logged. Anyone who lost this item can now submit a claim.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error reporting found item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
