import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Menu, Restaurant, MenuTheme } from '@/lib/types';

/**
 * Fetches the menu_theme record for a given menuId.
 * Returns a default theme if not found.
 */
export async function fetchMenuTheme(menuId: string): Promise<MenuTheme> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('menu_theme')
    .select('*')
    .eq('menu_id', menuId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch theme: ${error.message}`);

  // Return defaults matching Flutter's MenuThemeModel defaults
  return data ?? {
    id: '',
    menu_id: menuId,
    primary_color: '#FF0EA5E9',
    background_color: '#FFFFFFFF',
    font_family: 'Roboto',
    card_radius: 12,
    card_elevation: 12,
    created_at: new Date().toISOString(),
  };
}

/**
 * Fetches the Menu record and its associated Restaurant in a single query
 * using Supabase's join syntax.
 */
export async function fetchMenuWithRestaurant(
  menuId: string
): Promise<{ menu: Menu; restaurant: Restaurant }> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      restaurants (*)
    `)
    .eq('id', menuId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch menu: ${error.message}`);
  if (!data) throw new Error(`Menu not found: ${menuId}`);

  const { restaurants: restaurant, ...menu } = data;

  return {
    menu: menu as Menu,
    restaurant: restaurant as Restaurant,
  };
}
