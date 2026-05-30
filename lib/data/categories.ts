import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Category, CategoryWithItems, MenuItem } from '@/lib/types';

/**
 * Fetches all visible categories for a menu via the get_categories RPC,
 * mirroring MenuRepo.getCateogries() from the Flutter app.
 */
export async function fetchCategories(menuId: string): Promise<Category[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_categories', {
    p_menu_id: menuId,
  });

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);

  const categories = (data as Category[]) ?? [];

  // Only show visible categories on the public menu
  return categories.filter((c) => c.is_visible);
}

/**
 * Fetches visible categories with their items using a single RPC call.
 * Items are filtered for visibility and expired discounts are cleared.
 */
export async function fetchCategoriesWithItems(
  menuId: string
): Promise<CategoryWithItems[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase.rpc('get_categories_with_items', {
    p_menu_id: menuId,
  });

  if (error) {
    throw new Error(`Failed to fetch categories with items: ${error.message}`);
  }

  const rawCategories = (data as Array<CategoryWithItems & {
    items?: MenuItem[];
    menu_items?: MenuItem[];
    menuItems?: MenuItem[];
  }>) ?? [];

  const normalizeItems = (items: MenuItem[]): MenuItem[] => {
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
  };

  return rawCategories
    .filter((category) => category.is_visible)
    .map((category) => {
      const rawItems =
        category.items ?? category.menu_items ?? category.menuItems ?? [];
      return {
        ...category,
        items: normalizeItems(rawItems),
      };
    });
}
