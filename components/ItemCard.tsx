import type { MenuItem } from '../lib/types';
import Image from 'next/image';

interface Props {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export default function ItemCard({ item, onClick }: Props) {
  const discountVal = Number(item.discount || 0);
  const hasDiscount = discountVal > 0;
  const discountLabel = hasDiscount ? `${discountVal}% OFF` : null;
  const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;
  const priceVal = Number(item.price);
  const isPriceValid = !isNaN(priceVal);
  const basePrice = isPriceValid ? priceVal.toFixed(2) : item.price;
  const discountedPrice = hasDiscount && isPriceValid
    ? (priceVal * (1 - discountVal / 100)).toFixed(2)
    : null;

  return (
    <article
      className={`editorial-card${hasDiscount ? ' discounted' : ''}`}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick(item); }}
    >
      <div className="editorial-card-content">
        {discountLabel && (
          <span className="discount-chip">{discountLabel}</span>
        )}
        <h3 className="editorial-title">{item.name}</h3>
        <p className="editorial-desc">{item.description}</p>
        {hasDiscount && discountedPrice ? (
          <p className="editorial-price-line">
            <span className="editorial-price-original">${basePrice}</span>
            <span className="editorial-price-discounted">${discountedPrice}</span>
          </p>
        ) : (
          <p className="editorial-price">${basePrice}</p>
        )}
        <div className="editorial-affordance" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </div>
      </div>

      {imageUrl && (
        <div className="editorial-image-wrapper">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 600px) 110px, 140px"
            className="editorial-image"
          />
        </div>
      )}
    </article>
  );
}
