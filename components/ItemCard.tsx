import type { DietaryTag, MenuItem } from '../lib/types';
import Image from 'next/image';

export type ItemsViewMode = 'list' | 'grid';

interface Props {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
  /** Controls the card layout: horizontal (list) or stacked (grid). */
  viewMode?: ItemsViewMode;
}

/**
 * Maps each dietary tag to a short display label. Keeping this in one place
 * means the view layer never deals with raw enum values or free-form strings.
 */
const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: 'Veggie',
  vegan: 'Vegan',
  gluten_free: 'GF',
  spicy: 'Spicy',
  halal: 'Halal',
  popular: 'Popular',
};

/**
 * MenuItemCard
 * Reusable, responsive card for a single menu item. Supports two presentations:
 * - `list`: image on the right, content on the left (scannable, large tap target).
 * - `grid`: image on top, content below (compact, gallery-style).
 * Tapping anywhere (or pressing Enter) opens the item detail modal.
 */
export default function ItemCard({ item, onClick, viewMode = 'list' }: Props) {
  const isGrid = viewMode === 'grid';

  const discountVal = Number(item.discount || 0);
  const hasDiscount = discountVal > 0;
  const discountLabel = hasDiscount ? `${discountVal}% OFF` : null;
  const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;
  const priceVal = Number(item.price);
  const isPriceValid = !isNaN(priceVal);
  const basePrice = isPriceValid ? priceVal.toFixed(2) : item.price;
  const discountedPrice =
    hasDiscount && isPriceValid ? (priceVal * (1 - discountVal / 100)).toFixed(2) : null;
  const dietary = item.dietary_tags ?? [];

  return (
    <article
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onClick(item);
      }}
      className={[
        'group relative flex cursor-pointer gap-4 rounded-card border-2 bg-surface p-4 shadow-sm transition-all duration-500 ease-smooth hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.97]',
        isGrid ? 'flex-col items-stretch' : 'flex-row',
        hasDiscount
          ? 'border-discount/40 hover:border-discount/60'
          : 'border-border hover:border-primary',
      ].join(' ')}
    >
      <div
        className={[
          'flex min-w-0 flex-col justify-center',
          isGrid ? 'order-2' : 'flex-1',
        ].join(' ')}
      >
        {discountLabel && (
          <span className="mb-2 self-start rounded-full bg-discount/10 px-2.5 py-1 text-[0.72rem] font-extrabold uppercase tracking-wider text-discount">
            {discountLabel}
          </span>
        )}

        <h3
          className={[
            'text-lg font-bold leading-tight text-foreground',
            isGrid ? 'line-clamp-2' : 'truncate',
          ].join(' ')}
        >
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        )}

        {dietary.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Dietary information">
            {dietary.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[0.68rem] font-semibold text-muted-foreground"
              >
                {DIETARY_LABELS[tag]}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          {hasDiscount && discountedPrice ? (
            <p className="flex items-baseline gap-2 tabular-nums">
              <span className="text-sm font-semibold text-muted-foreground line-through">
                ${basePrice}
              </span>
              <span className="text-lg font-extrabold text-discount">${discountedPrice}</span>
            </p>
          ) : (
            <p className="text-base font-bold tabular-nums text-primary">${basePrice}</p>
          )}

          <span
            aria-hidden="true"
            className={[
              'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 group-hover:translate-x-1 group-hover:text-white',
              hasDiscount
                ? 'bg-discount/10 text-discount group-hover:bg-discount'
                : 'bg-border text-muted group-hover:bg-primary',
            ].join(' ')}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>

      {imageUrl && (
        <div
          className={[
            'relative shrink-0 overflow-hidden rounded-[calc(var(--card-radius)-4px)] bg-slate-100 dark:bg-neutral-800',
            isGrid ? 'order-1 aspect-square w-full' : 'h-[110px] w-[110px] md:h-[140px] md:w-[140px]',
          ].join(' ')}
        >
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 600px) 110px, 140px"
            className="animate-image-reveal object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </article>
  );
}
