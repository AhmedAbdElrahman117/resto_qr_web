# Resto QR Web Overview

This document summarizes the structure and behavior of the Next.js web client under resto_qr_web.

## Project purpose

Resto QR Web is a Next.js 14 app-router site that renders a digital restaurant menu. The core experience is the dynamic menu page at /menu/[menuId], which pulls menu and restaurant data from Supabase, applies a theme, and renders banners, categories, and items with a mobile-first design.

## Tech stack and configuration

- Framework: Next.js 14 app router with React 18
- Styling: Custom CSS in globals.css plus Tailwind utilities
- Data: Supabase (RPC and tables) via server-side client
- Images: next/image with remote patterns allowing any HTTPS host

Key config files:

- [resto_qr_web/package.json](resto_qr_web/package.json) defines scripts and dependencies.
- [resto_qr_web/next.config.mjs](resto_qr_web/next.config.mjs) allows remote images from any HTTPS host.
- [resto_qr_web/tailwind.config.ts](resto_qr_web/tailwind.config.ts) enables Tailwind and custom colors.
- [resto_qr_web/postcss.config.mjs](resto_qr_web/postcss.config.mjs) wires Tailwind.
- [resto_qr_web/tsconfig.json](resto_qr_web/tsconfig.json) sets strict TS and path alias @/*.
- [resto_qr_web/.eslintrc.json](resto_qr_web/.eslintrc.json) uses Next core web vitals rules.

## Routes and pages

- / (root): custom landing page at [resto_qr_web/app/page.tsx](resto_qr_web/app/page.tsx) that fetches live restaurant menus from Supabase.
- /menu/[menuId]: main menu page at [resto_qr_web/app/menu/[menuId]/page.tsx](resto_qr_web/app/menu/[menuId]/page.tsx).
- /menu/[menuId]/favicon.ico: dynamic restaurant logo favicon at [resto_qr_web/app/menu/[menuId]/favicon.ico/route.ts](resto_qr_web/app/menu/[menuId]/favicon.ico/route.ts).
- /api/events: POST endpoint for analytics logging at [resto_qr_web/app/api/events/route.ts](resto_qr_web/app/api/events/route.ts).
- /api/items: GET endpoint for items by category at [resto_qr_web/app/api/items/route.ts](resto_qr_web/app/api/items/route.ts).

Additional runtime UI states:

- Loading skeleton at [resto_qr_web/app/menu/[menuId]/loading.tsx](resto_qr_web/app/menu/[menuId]/loading.tsx).
- Error boundary at [resto_qr_web/app/menu/[menuId]/error.tsx](resto_qr_web/app/menu/[menuId]/error.tsx).

## Data layer and Supabase

Supabase client is created in [resto_qr_web/lib/supabase/client.ts](resto_qr_web/lib/supabase/client.ts). It uses a hard-coded Supabase URL and anon key, and disables session persistence for a stateless server-side client. The root landing page also uses this client to dynamically fetch live restaurants.

Data access helpers in [resto_qr_web/lib/data](resto_qr_web/lib/data):

- fetchMenuWithRestaurant in [resto_qr_web/lib/data/menu.ts](resto_qr_web/lib/data/menu.ts) selects a menu and joins its restaurant from the menus table.
- fetchMenuTheme in [resto_qr_web/lib/data/menu.ts](resto_qr_web/lib/data/menu.ts) reads from menu_theme and returns defaults if missing.
- fetchActiveBanners in [resto_qr_web/lib/data/banners.ts](resto_qr_web/lib/data/banners.ts) calls RPC get_active_banners.
- fetchCategories and fetchCategoriesWithItems in [resto_qr_web/lib/data/categories.ts](resto_qr_web/lib/data/categories.ts) call RPC get_categories and get_categories_with_items and normalize visibility and expired discounts.
- fetchItemsByCategory in [resto_qr_web/lib/data/items.ts](resto_qr_web/lib/data/items.ts) calls RPC get_items and normalizes visibility and expired discounts.
- incrementItemViewCount in [resto_qr_web/lib/data/items.ts](resto_qr_web/lib/data/items.ts) calls RPC increment_view_count.

Mock data helpers in [resto_qr_web/lib/data/mock.ts](resto_qr_web/lib/data/mock.ts) generate banners, categories, and items using picsum.photos. The main menu page currently uses these mock helpers instead of live Supabase category and banner data.

Types used across the app are defined in [resto_qr_web/lib/types/index.ts](resto_qr_web/lib/types/index.ts). They mirror the Flutter models and Supabase column names (snake_case).

## Main menu page behavior

The main menu page in [resto_qr_web/app/menu/[menuId]/page.tsx](resto_qr_web/app/menu/[menuId]/page.tsx) is a server component that:

- Validates menuId as a UUID and returns 404 if invalid or missing.
- Fetches menu and restaurant, plus the menu theme from Supabase.
- Logs menu visit analytics server-side via RPC increment_menu_view_count and log_event.
- Injects CSS variables for theme using buildCSSVariables from [resto_qr_web/lib/utils/color.ts](resto_qr_web/lib/utils/color.ts).
- Sets a data attribute for items view (list or grid) from localStorage to avoid a flash of layout change.
- Renders the core UI: MenuHeader, BannerCarousel, CategoryTabs, RestaurantLocation, and a powered-by footer.

Note: Banners and categories currently come from mock data rather than Supabase live data. This means the page does not yet use fetchActiveBanners or fetchCategoriesWithItems.

## Components

UI components live in [resto_qr_web/components](resto_qr_web/components):

- `MenuHeader` shows the restaurant logo/name and includes `DarkModeToggle`.
- `BannerCarousel` auto-advances banners, exposes manual arrows, and logs banner interactions via /api/events.
- `CategoryTabs` renders a sticky scrollable tab bar, list or grid items, and handles view-mode persistence.
- `ItemCard` renders a compact item summary and discount badge.
- `ItemModal` shows detailed item info with image carousel and locks body scroll.
- `RestaurantCardLink` renders a preview card linking to a specific restaurant's menu from the root page.
- `RestaurantLocation` renders a map embed and address.
- `RouteLoader` provides visual navigation progress feedback.
- `SkeletonCard` provides a generic item skeleton.
- `ThemeProvider` manages theme persistence and resolved light or dark state.

## Styling and theming

Global styles are defined in [resto_qr_web/app/globals.css](resto_qr_web/app/globals.css). Highlights:

- CSS variables define colors, shadows, typography, and component sizing.
- A dark theme is applied via the .dark class.
- Large blocks of custom styles define the layout for banners, tabs, item cards, modals, and loading skeletons.
- Tailwind base, components, and utilities are included at the bottom.

Theme handling:

- [resto_qr_web/app/layout.tsx](resto_qr_web/app/layout.tsx) injects a small script to set the dark class before hydration based on localStorage and system preference.
- `ThemeProvider` in [resto_qr_web/components/ThemeProvider.tsx](resto_qr_web/components/ThemeProvider.tsx) persists the chosen theme in localStorage under resto-theme.
- Menu theme variables (primary, background, font, radius, elevation) are injected at request time with buildCSSVariables in [resto_qr_web/lib/utils/color.ts](resto_qr_web/lib/utils/color.ts).

Fonts:

- globals.css imports Lato, Open Sans, and Roboto from Google Fonts.
- The app/fonts folder contains Geist fonts from the default Next template, but they are not wired into the layout.

## API routes

- /api/events expects JSON with menu_id, event_type, and optional item_id or banner_id. It calls the log_event RPC and never throws.
- /api/items expects a categoryId query param and returns items. If categoryId starts with category-mock-, it returns mock items.

## Observations and potential gaps

- The menu page uses mock banners and categories, so live Supabase data for categories and banners is not wired in yet.
- CategoryTabs does not call /api/items; it expects items to already be present in props.
- ItemModal sends analytics payload keys as menuId and eventType, but /api/events expects snake_case keys (menu_id, event_type). This likely prevents item_view events from being logged.
- RestaurantLocation uses fixed default coordinates rather than restaurant-specific coordinates.
