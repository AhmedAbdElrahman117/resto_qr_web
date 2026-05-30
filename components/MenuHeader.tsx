'use client';

import Image from 'next/image';
import type { Restaurant } from '../lib/types';
import DarkModeToggle from './DarkModeToggle';

interface Props {
  restaurant: Restaurant;
}

/**
 * MenuHeader
 * A sticky, app-style top navigation bar showing the restaurant's branding.
 * - Fixed to the top with a translucent, blurred surface so content scrolls under it.
 * - Tapping the brand scrolls the viewer back to the top (large mobile tap target).
 */
export default function MenuHeader({ restaurant }: Props) {
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
          <h1 className="max-w-[200px] truncate text-xl font-extrabold tracking-tight text-foreground md:max-w-none">
            {restaurant.restaurant_name}
          </h1>
        </button>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
