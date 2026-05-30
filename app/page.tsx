'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CategoryWithItems, MenuItem, Restaurant, Banner } from '@/lib/types';
import DarkModeToggle from '@/components/DarkModeToggle';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryTabs from '@/components/CategoryTabs';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Self-contained demo data so the page works immediately without a database.

const MOCK_RESTAURANT: Restaurant = {
  id: 'demo-restaurant',
  owner_id: 'demo-owner',
  restaurant_name: 'The Gourmet Kitchen',
  restaurant_address: '123 Culinary Lane, Foodie City, FC 12345',
  restaurant_logo_url: 'https://picsum.photos/seed/logo/200/200',
  restaurant_description: 'A modern dining experience with locally-sourced ingredients and innovative dishes.',
  menu_url: null,
  created_at: new Date().toISOString(),
};

const MENU_ID = 'demo-menu';

function generateMockBanners(): Banner[] {
  return [
    { id: 'banner-1', menu_id: MENU_ID, image_url: 'https://picsum.photos/seed/promo1/800/400', redirect_url: null, is_live: true, interactions: 0, expires_at: null, created_at: new Date().toISOString() },
    { id: 'banner-2', menu_id: MENU_ID, image_url: 'https://picsum.photos/seed/promo2/800/400', redirect_url: null, is_live: true, interactions: 0, expires_at: null, created_at: new Date().toISOString() },
    { id: 'banner-3', menu_id: MENU_ID, image_url: 'https://picsum.photos/seed/promo3/800/400', redirect_url: null, is_live: true, interactions: 0, expires_at: null, created_at: new Date().toISOString() },
    { id: 'banner-4', menu_id: MENU_ID, image_url: 'https://picsum.photos/seed/promo4/800/400', redirect_url: null, is_live: true, interactions: 0, expires_at: null, created_at: new Date().toISOString() },
  ];
}

function generateMockCategories(): CategoryWithItems[] {
  const categories = [
    { name: 'Starters', emoji: 'S', items: ['Bruschetta', 'Garlic Bread', 'Caesar Salad', 'Soup of the Day', 'Spring Rolls'] },
    { name: 'Main Courses', emoji: 'M', items: ['Grilled Salmon', 'Beef Tenderloin', 'Chicken Parmesan', 'Vegetable Risotto', 'Lamb Chops', 'Pasta Carbonara', 'Duck Confit'] },
    { name: 'Pizza', emoji: 'P', items: ['Margherita', 'Pepperoni', 'Four Cheese', 'BBQ Chicken', 'Veggie Supreme', 'Hawaiian'] },
    { name: 'Burgers', emoji: 'B', items: ['Classic Cheeseburger', 'Bacon BBQ Burger', 'Mushroom Swiss', 'Veggie Burger', 'Double Stack'] },
    { name: 'Pasta', emoji: 'A', items: ['Spaghetti Bolognese', 'Fettuccine Alfredo', 'Penne Arrabbiata', 'Lasagna', 'Ravioli'] },
    { name: 'Seafood', emoji: 'F', items: ['Lobster Tail', 'Shrimp Scampi', 'Fish & Chips', 'Calamari', 'Crab Cakes'] },
    { name: 'Desserts', emoji: 'D', items: ['Tiramisu', 'Chocolate Lava Cake', 'Cheesecake', 'Gelato', 'Crème Brûlée', 'Apple Pie'] },
    { name: 'Beverages', emoji: 'V', items: ['Fresh Lemonade', 'Iced Tea', 'Espresso', 'Cappuccino', 'Smoothies', 'Milkshakes'] },
  ];

  return categories.map((cat, catIndex) => ({
    id: `category-${catIndex}`,
    menu_id: MENU_ID,
    name: cat.name,
    image_url: `https://picsum.photos/seed/cat${catIndex}/100/100`,
    items_count: cat.items.length,
    is_visible: true,
    created_at: new Date().toISOString(),
    items: cat.items.map((itemName, itemIndex): MenuItem => {
      const hasDiscount = itemIndex % 3 === 0;
      const isPopular = itemIndex === 0;
      const isSpicy = cat.name === 'Main Courses' && itemIndex % 2 === 0;
      const isVegetarian = itemName.toLowerCase().includes('veggie') || itemName.toLowerCase().includes('vegetable');
      
      return {
        id: `item-${catIndex}-${itemIndex}`,
        category_id: `category-${catIndex}`,
        restaurant_id: MOCK_RESTAURANT.id,
        owner_id: MOCK_RESTAURANT.owner_id,
        name: itemName,
        description: `A delicious ${itemName.toLowerCase()} prepared with fresh ingredients and our chef's special touch. Perfect for any occasion.`,
        price: ((Math.random() * 25) + 8).toFixed(2),
        discount: hasDiscount ? String(10 + Math.floor(Math.random() * 20)) : null,
        image_urls: [`https://picsum.photos/seed/food${catIndex}${itemIndex}/400/400`],
        is_visible: true,
        views_count: Math.floor(Math.random() * 500),
        expires_at: null,
        created_at: new Date().toISOString(),
        dietary_tags: [
          ...(isPopular ? ['popular' as const] : []),
          ...(isSpicy ? ['spicy' as const] : []),
          ...(isVegetarian ? ['vegetarian' as const] : []),
        ],
      };
    }),
  }));
}

const MOCK_BANNERS = generateMockBanners();
const MOCK_CATEGORIES = generateMockCategories();

// ─── Demo Menu Header ─────────────────────────────────────────────────────────

function DemoMenuHeader({ restaurant }: { restaurant: Restaurant }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[200] border-b border-border bg-surface/85 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-colors duration-300 supports-[backdrop-filter]:bg-surface/85 dark:bg-[rgba(17,17,17,0.9)]">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
        >
          {restaurant.restaurant_logo_url ? (
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px] border border-border shadow-sm">
              <Image
                src={restaurant.restaurant_logo_url}
                alt={`${restaurant.restaurant_name} logo`}
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary text-xl font-extrabold text-white">
              {restaurant.restaurant_name.charAt(0)}
            </span>
          )}
          <div className="flex flex-col">
            <h1 className="max-w-[200px] truncate text-xl font-extrabold tracking-tight text-foreground md:max-w-none">
              {restaurant.restaurant_name}
            </h1>
            <span className="text-xs text-muted-foreground">Digital Menu</span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {/* Cart placeholder */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
            aria-label="View cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}

// ─── Restaurant Location Footer ───────────────────────────────────────────────

function DemoRestaurantLocation({ restaurant }: { restaurant: Restaurant }) {
  return (
    <section className="border-t border-border bg-surface px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-lg font-bold text-foreground">Visit Us</h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-foreground">{restaurant.restaurant_name}</p>
              <p className="text-sm text-muted-foreground">{restaurant.restaurant_address}</p>
            </div>
          </div>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.restaurant_address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary-soft px-4 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:ml-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            Get Directions
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function MenuViewerDemo() {
  return (
    <>
      {/* 1. Sticky Top Navigation */}
      <DemoMenuHeader restaurant={MOCK_RESTAURANT} />

      {/* Main scrollable area (offset below the fixed header) */}
      <main className="animate-page-enter pt-[68px]">
        {/* 2. Banners Section */}
        <BannerCarousel banners={MOCK_BANNERS} menuId={MENU_ID} />

        {/* 3. Categories & Items */}
        <CategoryTabs categories={MOCK_CATEGORIES} menuId={MENU_ID} />

        {/* 4. Location Footer */}
        <DemoRestaurantLocation restaurant={MOCK_RESTAURANT} />

        {/* 5. Powered By Footer */}
        <footer className="mt-2 flex flex-col items-center gap-4 border-t border-border px-4 pb-12 pt-8">
          <p className="text-[0.85rem] text-muted-foreground">
            Powered by <span className="font-extrabold text-muted">RestoQR</span>
          </p>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-surface px-5 py-2.5 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            aria-label="Download RestoQR on Google Play"
          >
            <svg className="shrink-0 text-foreground" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M3.18 23.5c.37.21.79.21 1.16.01l14.75-8.5-3.14-3.14L3.18 23.5zm-1.18-21v19c0 .45.25.84.62 1.05l12.38-12.38L2.62 1.45A1.17 1.17 0 0 0 2 2.5zM20.75 10.5l-2.97-1.71-3.37 3.38 3.37 3.37 2.99-1.72c.85-.49.85-1.83-.02-2.32zm-17.57-8L16.93 10l-3.14-3.14L3.18 1.5z" />
            </svg>
            <span className="flex flex-col gap-px">
              <span className="text-[0.7rem] font-normal leading-none text-muted">Get it on</span>
              <span className="text-base font-bold leading-none text-foreground">Google Play</span>
            </span>
          </a>
        </footer>
      </main>
    </>
  );
}
