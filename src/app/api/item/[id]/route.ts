import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const rawId = params.id; // e.g. "lost-1" or "found-2" or "1"

    let type: 'lost' | 'found' = 'lost';
    let numericId: number;

    if (rawId.startsWith('lost-')) {
      type = 'lost';
      numericId = parseInt(rawId.replace('lost-', ''), 10);
    } else if (rawId.startsWith('found-')) {
      type = 'found';
      numericId = parseInt(rawId.replace('found-', ''), 10);
    } else {
      numericId = parseInt(rawId, 10);
    }

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    if (type === 'lost') {
      const { data: item, error } = await supabaseAdmin
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
        .eq('lost_item_id', numericId)
        .single();

      if (error || !item) {
        return NextResponse.json({ error: 'Lost item not found' }, { status: 404 });
      }

      // Fetch potential matches for this lost item
      const { data: matches } = await supabaseAdmin
        .from('potential_match')
        .select(`
          match_id,
          match_score,
          match_status,
          found_item:found_item(
            found_item_id,
            item_name,
            brand,
            color,
            date_found,
            status,
            location:location(location_name)
          )
        `)
        .eq('lost_item_id', numericId)
        .order('match_score', { ascending: false });

      return NextResponse.json({
        type: 'lost',
        item,
        matches: matches || [],
      });
    } else {
      const { data: item, error } = await supabaseAdmin
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
        .eq('found_item_id', numericId)
        .single();

      if (error || !item) {
        return NextResponse.json({ error: 'Found item not found' }, { status: 404 });
      }

      // Fetch potential matches for this found item
      const { data: matches } = await supabaseAdmin
        .from('potential_match')
        .select(`
          match_id,
          match_score,
          match_status,
          lost_item:lost_item(
            lost_item_id,
            item_name,
            brand,
            color,
            date_lost,
            status,
            location:location(location_name)
          )
        `)
        .eq('found_item_id', numericId)
        .order('match_score', { ascending: false });

      return NextResponse.json({
        type: 'found',
        item,
        matches: matches || [],
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error loading item';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
