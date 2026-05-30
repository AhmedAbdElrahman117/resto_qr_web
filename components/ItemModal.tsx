import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { MenuItem } from '../lib/types';

interface Props {
  item: MenuItem;
  menuId: string;
  onClose: () => void;
}

export default function ItemModal({ item, menuId, onClose }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 350); // Wait for the 300ms/400ms CSS animations to finish
  }, [isClosing, onClose]);

  // Fire item view analytics
  useEffect(() => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menuId,
        eventType: 'item_view',
        itemId: item.id
      })
    }).catch(() => { });
  }, [item.id, menuId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  // Lock body scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const discountVal = Number(item.discount || 0);
  const hasDiscount = discountVal > 0;
  const priceVal = Number(item.price);
  const isPriceValid = !isNaN(priceVal);
  const basePrice = isPriceValid ? priceVal.toFixed(2) : item.price;
  const discountedPrice = hasDiscount && isPriceValid
    ? (priceVal * (1 - discountVal / 100)).toFixed(2)
    : null;

  const images = item.image_urls || [];
  const hasMultipleImages = images.length > 1;
  const currentImageUrl = images[activeImageIndex] || null;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        className={`modal-sheet ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-drag-handle" aria-hidden="true" />
        <button
          className="modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="modal-split-layout">
          {images.length > 0 && (
            <div className="modal-image-col">
              {images.map((imgUrl, i) => (
                <Image
                  key={imgUrl}
                  src={imgUrl}
                  alt={`${item.name} - image ${i + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={`modal-img ${i === activeImageIndex ? 'active' : ''}`}
                  priority={i === 0}
                />
              ))}
              {hasMultipleImages && (
                <>
                  <button className="modal-nav-btn prev" onClick={prevImage} aria-label="Previous Image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <button className="modal-nav-btn next" onClick={nextImage} aria-label="Next Image">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                  <div className="modal-img-progress">
                    {images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`modal-img-progress-bar ${i === activeImageIndex ? 'active' : ''}`} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="modal-details-col">
            <div className="modal-content">
              <h2 id="modal-title" className="modal-title">{item.name}</h2>

              <div className="modal-price-wrap">
                {hasDiscount && discountedPrice ? (
                  <div className="modal-price-line">
                    <span className="modal-price-original">${basePrice}</span>
                    <span className="modal-price-discounted">${discountedPrice}</span>
                  </div>
                ) : (
                  <span className="modal-price">${basePrice}</span>
                )}
                {hasDiscount && discountedPrice && (
                  <span className="modal-discount">-{item.discount}% OFF</span>
                )}
              </div>

              {item.description && (
                <>
                  <div className="modal-divider" />
                  <h3 className="modal-desc-title">About this item</h3>
                  <p className="modal-desc">{item.description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
