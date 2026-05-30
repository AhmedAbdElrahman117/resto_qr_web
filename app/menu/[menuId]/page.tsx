import { type Metadata, type Viewport } from 'next';
import { notFound } from 'next/navigation';

import { fetchMenuTheme, fetchMenuWithRestaurant } from '../../../lib/data/menu';
import { buildCSSVariables, flutterHexToRgbHex } from '../../../lib/utils/color';
import { createServerSupabaseClient } from '../../../lib/supabase/client';
import { getMockBanners, getMockCategoriesWithItems } from '../../../lib/data/mock';

import MenuHeader from '../../../components/MenuHeader';
import BannerCarousel from '../../../components/BannerCarousel';
import CategoryTabs from '../../../components/CategoryTabs';
import RestaurantLocation from '../../../components/RestaurantLocation';

interface Props {
  params: { menuId: string };
}

// ─── Dynamic SEO Metadata & Viewport ──────────────────────────────────────────

export async function generateViewport({ params }: Props): Promise<Viewport> {
  try {
    const theme = await fetchMenuTheme(params.menuId);
    return {
      themeColor: flutterHexToRgbHex(theme.primary_color),
    };
  } catch {
    return {};
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { restaurant } = await fetchMenuWithRestaurant(params.menuId);
    const faviconUrl = restaurant.restaurant_logo_url || '/logo.svg';

    return {
      title: `${restaurant.restaurant_name} — Digital Menu`,
      description:
        restaurant.restaurant_description ??
        `Browse the full menu of ${restaurant.restaurant_name}. Discover our categories and items.`,
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
      openGraph: {
        title: restaurant.restaurant_name,
        description: restaurant.restaurant_description ?? undefined,
        images: restaurant.restaurant_logo_url
          ? [restaurant.restaurant_logo_url]
          : [],
      },
    };
  } catch {
    return { title: 'Digital Menu' };
  }
}

// ─── Server Component (SSR) ───────────────────────────────────────────────────

export default async function MenuPage({ params }: Props) {
  const { menuId } = params;

  // Validate that the menuId is a UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(menuId)) {
    notFound();
  }

  const [{ restaurant }, theme] = await Promise.all([
    fetchMenuWithRestaurant(menuId),
    fetchMenuTheme(menuId),
  ]).catch((err: unknown) => {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Menu not found')) {
      notFound();
    }
    throw err;
  });

  const mockBanners = getMockBanners(menuId);
  const mockCategories = getMockCategoriesWithItems(menuId);

  // Fire menu view analytics (non-blocking, server-side)
  const supabase = createServerSupabaseClient();
  supabase.rpc('increment_menu_view_count', { p_menu_id: menuId }).then(({ error }) => {
    if (error) console.error('Error incrementing view count:', error);
  });
  supabase.rpc('log_event', {
    p_menu_id: menuId,
    p_event_type: 'menu_visit',
    p_item_id: null,
    p_banner_id: null,
  }).then(({ error }) => {
    if (error) console.error('Error logging event:', error);
  });

  // Build CSS variables string — injected server-side to prevent FOUC
  const cssVars = buildCSSVariables(theme);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              var key = 'resto-items-view:${menuId}';
              var stored = localStorage.getItem(key);
              if (stored === 'list' || stored === 'grid') {
                document.documentElement.dataset.itemsView = stored;
              } else {
                document.documentElement.dataset.itemsView = 'list';
              }
            } catch (_) {}
          `,
        }}
      />

      {/* 1. Sticky Top Navigation */}
      <MenuHeader restaurant={restaurant} />

      {/* Main scrollable area */}
      <main className="menu-main-content page-enter">
        {/* 2. Banners Section */}
        {mockBanners.length > 0 && (
          <BannerCarousel banners={mockBanners} menuId={menuId} />
        )}

        {/* 3. Categories & Items */}
        {mockCategories.length > 0 ? (
          <CategoryTabs categories={mockCategories} menuId={menuId} />
        ) : (
          <div className="empty-state" style={{ paddingTop: '60px' }}>
            <div className="empty-state-icon">🍽️</div>
            <p>No menu items available yet.</p>
          </div>
        )}

        {/* 4. Location Footer */}
        <RestaurantLocation restaurant={restaurant} />

        {/* 5. Powered By Footer */}
        <footer className="powered-by-footer">
          <p className="powered-by-text">
            Powered by <span className="powered-by-brand">RestoQR</span>
          </p>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="google-play-btn"
            aria-label="Download RestoQR on Google Play"
          >
            <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3.18 23.5c.37.21.79.21 1.16.01l14.75-8.5-3.14-3.14L3.18 23.5zm-1.18-21v19c0 .45.25.84.62 1.05l12.38-12.38L2.62 1.45A1.17 1.17 0 0 0 2 2.5zM20.75 10.5l-2.97-1.71-3.37 3.38 3.37 3.37 2.99-1.72c.85-.49.85-1.83-.02-2.32zm-17.57-8L16.93 10l-3.14-3.14L3.18 1.5z" />
            </svg>
            <span className="play-btn-text">
              <span className="play-btn-sub">Get it on</span>
              <span className="play-btn-main">Google Play</span>
            </span>
          </a>
        </footer>
      </main>
    </>
  );
}
