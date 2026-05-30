import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { MenuItem } from '@/lib/types';

/**
 * Fetches all items for a specific category via the get_items RPC.
 * Mirrors ItemsRepo.getItems() from the Flutter app.
 * Only visible items are returned (filtered client-side for safety).
 *
 * This is called per-tab (lazy loading) from the client component.
 */
export async function fetchItemsByCategory(
  categoryId: string
): Promise<MenuItem[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_items', {
    p_category_id: categoryId,
  });

  if (error) throw new Error(`Failed to fetch items: ${error.message}`);

  const items = (data as MenuItem[]) ?? [];

  // Filter expired discounts client-side (matching Flutter's ItemModel.fromMap logic)
  return items
    .filter((item) => item.is_visible)
    .map((item) => {
      const isExpired =
        item.expires_at != null &&
        new Date(item.expires_at) < new Date();
      return isExpired
        ? { ...item, discount: null, expires_at: null }
        : item;
    });
}

/**
 * Fire-and-forget: increments view count for an item.
 * Called server-side via Route Handler when a user opens an item modal.
 */
export async function incrementItemViewCount(itemId: string): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.rpc('increment_view_count', { p_item_id: itemId });
}
