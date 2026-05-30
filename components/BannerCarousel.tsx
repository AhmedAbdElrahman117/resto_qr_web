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

  // Responsive items per view logic
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
    
    // Initial check
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

  // Auto-advance every 7 seconds
  useEffect(() => {
    if (maxIndex <= 0) return; // Don't auto-advance if all items fit
    
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

  // If there are no banners, don't render anything
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

  const bannerCountStr = banners.length >= 3 ? '3-plus' : banners.length.toString();

  return (
    <section className="banners-section" aria-label="Promotions" data-banners={bannerCountStr}>
      <div className="banner-track-wrapper">
        <div
          className="banner-track"
          style={{ transform: `translateX(-${translateX}%)` }}
        >
          {banners.map((banner, i) => {
            const isFocused = i === activeIndex;
            
            return (
              <div 
                key={banner.id} 
                className={`banner-slide ${isFocused ? 'is-focused' : 'is-faded'}`}
              >
                <div className="banner-slide-inner">
                  <Image
                    src={banner.image_url}
                    alt={`Promotion ${i + 1}`}
                    width={900}
                    height={400}
                    className="banner-img"
                    onClick={() => handleBannerClick(banner)}
                    style={{ cursor: banner.redirect_url ? 'pointer' : 'default' }}
                    priority={i < itemsPerView}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        {showControls && (
          <>
            <button className="banner-arrow banner-arrow-left" onClick={prevSlide} aria-label="Previous banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="banner-arrow banner-arrow-right" onClick={nextSlide} aria-label="Next banner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Controls: Smooth Page Indicator Dots */}
      {showControls && (
        <div className="banner-controls">
          <div className="banner-dots-container" role="tablist" aria-label="Banner navigation">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`banner-dot-circle ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
