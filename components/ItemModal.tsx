'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MenuItem } from '../lib/types';

interface Props {
  item: MenuItem;
  menuId: string;
  onClose: () => void;
}

/**
 * ItemModal
 * Immersive item detail view. Presents as a bottom sheet on mobile and a centered
 * dialog on desktop (lg+). Handles an image carousel, body-scroll locking, Escape
 * to close, and a coordinated open/close animation.
 */
export default function ItemModal({ item, menuId, onClose }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 350);
  }, [isClosing, onClose]);

  useEffect(() => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId, eventType: 'item_view', itemId: item.id }),
    }).catch(() => {});
  }, [item.id, menuId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const discountVal = Number(item.discount || 0);
  const hasDiscount = discountVal > 0;
  const priceVal = Number(item.price);
  const isPriceValid = !isNaN(priceVal);
  const basePrice = isPriceValid ? priceVal.toFixed(2) : item.price;
  const discountedPrice =
    hasDiscount && isPriceValid ? (priceVal * (1 - discountVal / 100)).toFixed(2) : null;

  const images = item.image_urls || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div
      onClick={handleClose}
      className={[
        'fixed inset-0 z-[1000] flex items-end justify-center bg-[rgba(15,23,42,0.4)] backdrop-blur-xl backdrop-saturate-150 dark:bg-black/60 lg:items-center lg:p-10',
        isClosing ? 'animate-fade-out' : 'animate-fade-in',
      ].join(' ')}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={[
          'relative flex h-[90dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[32px] border-t border-white/50 bg-white/85 shadow-[0_-20px_60px_rgba(0,0,0,0.1)] backdrop-blur-[40px] dark:border-white/10 dark:bg-[rgba(20,20,25,0.85)]',
          'lg:h-auto lg:max-h-[85vh] lg:max-w-[1000px] lg:rounded-[32px] lg:border',
          isClosing
            ? 'animate-slide-down lg:animate-scale-down'
            : 'animate-slide-up lg:animate-scale-up',
        ].join(' ')}
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-3 z-20 h-[5px] w-12 -translate-x-1/2 rounded-[3px] bg-black/20 dark:bg-white/30 lg:hidden"
        />
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/70 text-slate-900 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-white dark:border-white/15 dark:bg-black/60 dark:text-white dark:hover:bg-[#222]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="scrollbar-hide flex h-full flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
          {images.length > 0 && (
            <div className="group relative h-[45vh] min-h-[300px] w-full shrink-0 bg-slate-100 dark:bg-neutral-900 lg:h-auto lg:min-h-[600px] lg:w-[45%]">
              {images.map((imgUrl, i) => (
                <Image
                  key={imgUrl}
                  src={imgUrl}
                  alt={`${item.name} - image ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`object-cover transition-opacity duration-500 ${i === activeImageIndex ? 'opacity-100' : 'opacity-0'}`}
                  priority={i === 0}
                />
              ))}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous Image"
                    className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 opacity-0 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white group-hover:opacity-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Next Image"
                    className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-neutral-900 opacity-0 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-white group-hover:opacity-100"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-xl bg-black/30 px-2.5 py-1.5 backdrop-blur-md">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-sm transition-all duration-300 ${i === activeImageIndex ? 'w-8 bg-white' : 'w-6 bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="relative flex flex-1 flex-col lg:h-full lg:min-h-[600px] lg:w-[55%] lg:overflow-y-auto">
            <div className="flex-1 px-6 pb-[60px] pt-8 lg:p-12 lg:pb-[60px]">
              <h2 id="modal-title" className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground lg:text-[2.8rem]">
                {item.name}
              </h2>

              <div className="mb-7 flex items-center gap-3">
                {hasDiscount && discountedPrice ? (
                  <div className="inline-flex items-baseline gap-3 tabular-nums">
                    <span className="text-lg font-semibold text-muted-foreground line-through">${basePrice}</span>
                    <span className="text-[1.8rem] font-extrabold text-discount lg:text-[2.2rem]">${discountedPrice}</span>
                  </div>
                ) : (
                  <span className="text-[1.6rem] font-extrabold tabular-nums text-primary lg:text-3xl">${basePrice}</span>
                )}
                {hasDiscount && discountedPrice && (
                  <span className="rounded-xl border border-discount/20 bg-discount/10 px-3 py-1.5 text-sm font-extrabold tracking-wide text-discount">
                    -{item.discount}% OFF
                  </span>
                )}
              </div>

              {item.description && (
                <>
                  <div className="my-8 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-60" />
                  <h3 className="mb-4 text-[0.85rem] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
                    About this item
                  </h3>
                  <p className="text-lg leading-[1.8] text-muted">{item.description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
