'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Banner } from '../lib/types';

interface Props {
  banners: Banner[];
  menuId: string;
}

export default function BannerCarousel({ banners, menuId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  // Responsive items-per-view: 1 (mobile) / 2 (tablet) / 3 (desktop).
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isThreeBannerMode = itemsPerView === 3 && banners.length >= 3;
  const isTwoBannerMode = itemsPerView === 2 && banners.length >= 2;
  const isDynamicMode = isThreeBannerMode || isTwoBannerMode;

  const maxIndex = isDynamicMode
    ? banners.length - 1
    : Math.max(0, banners.length - itemsPerView);

  useEffect(() => {
    if (maxIndex <= 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 7000);
    return () => clearInterval(interval);
  }, [maxIndex, activeIndex]);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const logBannerInteraction = useCallback(
    async (bannerId: string) => {
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            menu_id: menuId,
            event_type: 'banner_interaction',
            banner_id: bannerId,
          }),
        });
      } catch {
        // Fire-and-forget
      }
    },
    [menuId]
  );

  const handleBannerClick = (banner: Banner) => {
    logBannerInteraction(banner.id);
    if (banner.redirect_url) {
      window.open(banner.redirect_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!banners || banners.length === 0) return null;

  const showControls = maxIndex > 0;

  let translateX = 0;
  if (isThreeBannerMode) {
    const maxTranslate = banners.length * 25 - 75;
    translateX = Math.max(0, Math.min(activeIndex * 25 - 25, maxTranslate));
  } else if (isTwoBannerMode) {
    const maxTranslate = banners.length * 40 - 80;
    translateX = Math.max(0, Math.min(activeIndex * 40 - 40, maxTranslate));
  } else {
    translateX = activeIndex * (100 / itemsPerView);
  }

  // Per-slide width / focus styling. Computed here (rather than via CSS data
  // attributes) so the carousel layout stays in one place with its logic.
  const slideStyle = (isFocused: boolean): React.CSSProperties => {
    if (isThreeBannerMode) {
      return { width: isFocused ? '50%' : '25%', opacity: isFocused ? 1 : 0.35, transform: isFocused ? 'scale(1)' : 'scale(0.96)' };
    }
    if (isTwoBannerMode) {
      return { width: isFocused ? '60%' : '40%', opacity: isFocused ? 1 : 0.35, transform: isFocused ? 'scale(1)' : 'scale(0.96)' };
    }
    return { width: '100%' };
  };

  return (
    <section className="relative mt-5 px-4 pb-8" aria-label="Promotions">
      <div className="relative -m-4 overflow-hidden p-4">
        <div
          className="-mx-2 flex transition-transform duration-500 ease-spring"
          style={{ transform: `translateX(-${translateX}%)` }}
        >
          {banners.map((banner, i) => {
            const isFocused = i === activeIndex;
            return (
              <div
                key={banner.id}
                className="shrink-0 px-2 transition-all duration-500 ease-spring"
                style={slideStyle(isFocused)}
              >
                <div
                  className={[
                    'group relative overflow-hidden rounded-3xl border border-border transition-shadow duration-500',
                    isFocused ? 'shadow-lg' : 'shadow-sm',
                  ].join(' ')}
                >
                  <Image
                    src={banner.image_url}
                    alt={`Promotion ${i + 1}`}
                    width={900}
                    height={400}
                    onClick={() => handleBannerClick(banner)}
                    style={{ cursor: banner.redirect_url ? 'pointer' : 'default' }}
                    priority={i < itemsPerView}
                    className="aspect-[2/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {showControls && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground opacity-70 shadow-sm transition-all hover:scale-110 hover:opacity-100 hover:shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground opacity-70 shadow-sm transition-all hover:scale-110 hover:opacity-100 hover:shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {showControls && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center gap-2" role="tablist" aria-label="Banner navigation">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to banner ${i + 1}`}
                className={[
                  'h-2 rounded-full transition-all duration-300',
                  i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-primary-soft',
                ].join(' ')}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
