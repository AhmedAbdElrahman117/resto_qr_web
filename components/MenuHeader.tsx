'use client';

import Image from 'next/image';
import type { Restaurant } from '../lib/types';
import DarkModeToggle from './DarkModeToggle';

interface Props {
  restaurant: Restaurant;
}

export default function MenuHeader({ restaurant }: Props) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="top-nav">
      <div className="top-nav-content">
        <button className="top-nav-brand" onClick={scrollToTop} aria-label="Scroll to top">
          {restaurant.restaurant_logo_url ? (
            <div className="top-nav-logo-wrapper">
              <Image
                src={restaurant.restaurant_logo_url}
                alt={`${restaurant.restaurant_name} logo`}
                fill
                sizes="40px"
                className="top-nav-logo"
                priority
              />
            </div>
          ) : (
            <div className="top-nav-logo-fallback">
              {restaurant.restaurant_name.charAt(0)}
            </div>
          )}
          <h1 className="top-nav-title">{restaurant.restaurant_name}</h1>
        </button>
        
        <div className="top-nav-actions">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
