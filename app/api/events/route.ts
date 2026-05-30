import { createServerSupabaseClient } from '../../../lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/events
 * Body: { menu_id, event_type, item_id?, banner_id? }
 *
 * Client Components call this to log analytics events server-side,
 * avoiding direct Supabase RPC calls from the browser.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { menu_id, event_type, item_id, banner_id } = body;

    if (!menu_id || !event_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    await supabase.rpc('log_event', {
      p_menu_id: menu_id,
      p_event_type: event_type,
      p_item_id: item_id ?? null,
      p_banner_id: banner_id ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never crash — analytics are fire-and-forget
    console.error('Event logging failed:', err);
    return NextResponse.json({ ok: true });
  }
}
