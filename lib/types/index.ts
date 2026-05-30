// ─── Domain Types ─────────────────────────────────────────────────────────────
// These mirror the Flutter Dart models exactly, using the same field names
// as the Supabase column names (snake_case).

export interface MenuTheme {
  id: string;
  menu_id: string;
  primary_color: string;    // #AARRGGBB Flutter hex
  background_color: string; // #AARRGGBB Flutter hex
  font_family: string;      // 'Roboto' | 'Lato' | 'Open Sans'
  card_radius: number;
  card_elevation: number;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_logo_url: string | null;
  restaurant_description: string | null;
  menu_url: string | null;
  created_at: string;
}

export interface Menu {
  id: string;
  restaurant_id: string;
  title: string;
  views_count: number;
  created_at: string;
}

export interface Category {
  id: string;
  menu_id: string;
  name: string;
  image_url: string | null;
  items_count: number;
  is_visible: boolean;
  created_at: string;
}

export interface CategoryWithItems extends Category {
  items: MenuItem[];
}

// ─── Dietary Badges ─────────────────────────────────────────────────────────
// Small, presentation-friendly tags surfaced on item cards (e.g. "Vegan",
// "Spicy"). Kept as a discriminated, finite union so the UI can map each tag to
// a consistent icon/label without free-form strings leaking into the view layer.

export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "spicy"
  | "halal"
  | "popular";

export interface DietaryBadge {
  tag: DietaryTag;
  label: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  restaurant_id: string;
  owner_id: string;
  name: string;
  description: string | null;
  price: string;
  discount: string | null;
  image_urls: string[];
  is_visible: boolean;
  views_count: number;
  expires_at: string | null;
  created_at: string;
  /** Optional dietary tags rendered as badges on the item card. */
  dietary_tags?: DietaryTag[];
}

export interface Banner {
  id: string;
  menu_id: string;
  image_url: string;
  redirect_url: string | null;
  is_live: boolean;
  interactions: number;
  expires_at: string | null;
  created_at: string;
}

// ─── Composed Page Data ────────────────────────────────────────────────────────

export interface MenuPageData {
  menu: Menu;
  restaurant: Restaurant;
  theme: MenuTheme;
  categories: Category[];
  banners: Banner[];
}
