import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Banner } from '@/lib/types';

/**
 * Fetches active (live + non-expired) banners for the menu.
 * Uses the get_active_banners RPC, matching HomeRepo.getActiveBanners().
 */
export async function fetchActiveBanners(menuId: string): Promise<Banner[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_active_banners', {
    p_menu_id: menuId,
  });

  if (error) {
    // Banners are non-critical — return empty array instead of throwing
    console.error('Failed to fetch banners:', error.message);
    return [];
  }

  return (data as Banner[]) ?? [];
}
