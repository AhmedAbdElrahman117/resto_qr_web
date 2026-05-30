'use client';

import { useState, useEffect, useRef } from 'react';
import type { CategoryWithItems, MenuItem } from '../lib/types';
import ItemCard, { type ItemsViewMode } from './ItemCard';
import ItemModal from './ItemModal';
import Image from 'next/image';

interface Props {
  categories: CategoryWithItems[];
  menuId: string;
}

export default function CategoryTabs({ categories, menuId }: Props) {
  const allCategoryId = `all-${menuId}`;
  const offersCategoryId = `offers-${menuId}`;
  const allItems: MenuItem[] = categories.flatMap((category) => category.items ?? []);
  const discountedItemsAll: MenuItem[] = allItems.filter(
    (item) => Number(item.discount ?? 0) > 0
  );
  const hasOffers = discountedItemsAll.length > 0;
  const firstCategory = categories[0];
  const categoriesWithAll: CategoryWithItems[] = firstCategory
    ? [
      {
        id: allCategoryId,
        menu_id: firstCategory.menu_id,
        name: 'All',
        image_url: null,
        items_count: allItems.length,
        is_visible: true,
        created_at: firstCategory.created_at,
        items: allItems,
      },
      ...(hasOffers
        ? [
          {
            id: offersCategoryId,
            menu_id: firstCategory.menu_id,
            name: 'Offers',
            image_url: '/offer.svg',
            items_count: discountedItemsAll.length,
            is_visible: true,
            created_at: firstCategory.created_at,
            items: discountedItemsAll,
          },
        ]
        : []),
      ...categories,
    ]
    : categories;

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categoriesWithAll[0]?.id || ''
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [animateNonce, setAnimateNonce] = useState(0);
  const [itemsViewMode, setItemsViewMode] = useState<ItemsViewMode>('list');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const viewTransitionMs = 120;
  const storageKey = `resto-items-view:${menuId}`;

  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navWrapperRef = useRef<HTMLDivElement>(null);
  const viewChangeTimeoutRef = useRef<number | null>(null);
  const viewResetTimeoutRef = useRef<number | null>(null);
  const skipInitialWriteRef = useRef(true);

  const setDocumentItemsView = (mode: ItemsViewMode) => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.itemsView = mode;
    }
  };

  useEffect(() => {
    return () => {
      if (viewChangeTimeoutRef.current) {
        window.clearTimeout(viewChangeTimeoutRef.current);
      }
      if (viewResetTimeoutRef.current) {
        window.clearTimeout(viewResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const mode = stored === 'list' || stored === 'grid' ? stored : 'list';
      setItemsViewMode(mode);
      setDocumentItemsView(mode);
    } catch {
      // Ignore read errors (e.g. privacy mode)
    }
  }, [storageKey]);

  useEffect(() => {
    if (skipInitialWriteRef.current) {
      skipInitialWriteRef.current = false;
      return;
    }
    try {
      localStorage.setItem(storageKey, itemsViewMode);
    } catch {
      // Ignore write errors
    }
  }, [itemsViewMode, storageKey]);

  useEffect(() => {
    if (!categories.length) return;
    const exists =
      activeCategoryId === allCategoryId ||
      (hasOffers && activeCategoryId === offersCategoryId) ||
      categories.some((category) => category.id === activeCategoryId);
    if (!exists) {
      setActiveCategoryId(allCategoryId);
    }
  }, [activeCategoryId, allCategoryId, categories, hasOffers, offersCategoryId]);

  // Category scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = tabsRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categoriesWithAll.length]);

  const scrollBy = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const { clientWidth } = tabsRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth / 2) : clientWidth / 2;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Center the active tab on click, then scroll the items list back to the top.
  const handleTabClick = (categoryId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (categoryId !== activeCategoryId) {
      setAnimateNonce((prev) => prev + 1);
      setActiveCategoryId(categoryId);
    }
    const tabElement = event.currentTarget;
    if (tabsRef.current) {
      const container = tabsRef.current;
      const scrollLeft =
        tabElement.offsetLeft - container.offsetWidth / 2 + tabElement.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    if (sectionRef.current && navWrapperRef.current) {
      const headerOffset = 68;
      const navWrapperHeight = navWrapperRef.current.offsetHeight;
      const y =
        sectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        headerOffset -
        navWrapperHeight;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const currentCategory = categoriesWithAll.find((category) => category.id === activeCategoryId);
  const isAllCategory = activeCategoryId === allCategoryId;
  const currentItems: MenuItem[] = isAllCategory ? allItems : currentCategory?.items ?? [];
  const mostViewedItems: MenuItem[] = isAllCategory
    ? [...allItems].sort((a, b) => Number(b.views_count) - Number(a.views_count)).slice(0, 7)
    : [];
  const discountedItems: MenuItem[] = isAllCategory ? discountedItemsAll : [];
  const allSections = isAllCategory
    ? [
      { id: 'most-viewed', title: 'Most Viewed', items: mostViewedItems },
      { id: 'discounts', title: 'Discounts', items: discountedItems },
      ...categories.map((category) => ({
        id: category.id,
        title: category.name,
        items: category.items ?? [],
      })),
    ].filter((section) => section.items.length > 0)
    : [];
  const itemsAnimationKey = `items-${activeCategoryId}-${animateNonce}`;

  // Tailwind grid columns differ between the compact "grid" view and the
  // scannable "list" view. Driven by React state for SSR-safe, selector-free styling.
  const gridColumns =
    itemsViewMode === 'grid'
      ? 'grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'
      : 'grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3';
  const listClassName = `grid ${gridColumns} ${
    isViewTransitioning ? 'translate-y-1.5 opacity-0' : 'animate-items-up'
  }`;

  const handleViewChange = (mode: ItemsViewMode) => {
    if (mode === itemsViewMode) return;

    setIsViewTransitioning(true);

    if (viewChangeTimeoutRef.current) {
      window.clearTimeout(viewChangeTimeoutRef.current);
    }
    if (viewResetTimeoutRef.current) {
      window.clearTimeout(viewResetTimeoutRef.current);
    }

    viewChangeTimeoutRef.current = window.setTimeout(() => {
      setItemsViewMode(mode);
      setDocumentItemsView(mode);
      viewResetTimeoutRef.current = window.setTimeout(() => {
        setIsViewTransitioning(false);
      }, viewTransitionMs);
    }, viewTransitionMs);
  };

  const arrowClass =
    'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm transition-all duration-200 hover:bg-background hover:shadow-md';

  return (
    <>
      {/* Sticky horizontal category navigation */}
      <div
        ref={navWrapperRef}
        className="sticky top-[68px] z-[100] border-b border-border bg-surface/85 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/85 dark:bg-[rgba(17,17,17,0.85)]"
      >
        <div className="relative flex items-center">
          {canScrollLeft && (
            <button
              className={`${arrowClass} left-2`}
              onClick={() => scrollBy('left')}
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div ref={tabsRef} role="tablist" className="scrollbar-hide flex w-full gap-6 overflow-x-auto scroll-smooth px-6">
            {categoriesWithAll.map((category) => {
              const isActive = activeCategoryId === category.id;
              return (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => handleTabClick(category.id, e)}
                  className={[
                    'relative my-1.5 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[40px] border-2 py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border text-muted hover:border-primary hover:text-foreground',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full',
                      isActive ? 'bg-primary-soft' : 'bg-border',
                    ].join(' ')}
                  >
                    {category.image_url ? (
                      <Image src={category.image_url} alt="" width={28} height={28} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className={`text-[0.85rem] font-extrabold uppercase ${isActive ? 'text-primary' : 'text-muted'}`}>
                        {category.name.charAt(0)}
                      </span>
                    )}
                  </span>
                  <span className="leading-none">{category.name}</span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              className={`${arrowClass} right-2`}
              onClick={() => scrollBy('right')}
              aria-label="Scroll right"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <section ref={sectionRef} className="scroll-mt-[140px] px-4 pb-10 pt-4">
        <div className="mb-3 flex justify-end gap-2.5" role="group" aria-label="Items view">
          {(['list', 'grid'] as const).map((mode) => {
            const active = itemsViewMode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleViewChange(mode)}
                aria-pressed={active}
                className={[
                  'inline-flex items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-border bg-surface text-muted hover:border-primary hover:text-foreground',
                ].join(' ')}
              >
                {mode === 'list' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <circle cx="4" cy="6" r="1.5" />
                    <circle cx="4" cy="12" r="1.5" />
                    <circle cx="4" cy="18" r="1.5" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="8" height="8" rx="1" />
                    <rect x="13" y="3" width="8" height="8" rx="1" />
                    <rect x="3" y="13" width="8" height="8" rx="1" />
                    <rect x="13" y="13" width="8" height="8" rx="1" />
                  </svg>
                )}
                <span className="capitalize">{mode}</span>
              </button>
            );
          })}
        </div>

        {currentItems.length > 0 ? (
          isAllCategory ? (
            <div
              key={itemsAnimationKey}
              className={`flex flex-col gap-7 ${isViewTransitioning ? 'translate-y-1.5 opacity-0' : 'animate-items-up'}`}
            >
              {allSections.map((section) => (
                <div key={section.id} className="flex flex-col gap-3">
                  <p className="text-lg font-extrabold tracking-wide text-foreground">{section.title}</p>
                  <div className={listClassName}>
                    {section.items.map((item) => (
                      <ItemCard key={item.id} item={item} onClick={setSelectedItem} viewMode={itemsViewMode} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div key={itemsAnimationKey} className={listClassName}>
              {currentItems.map((item) => (
                <ItemCard key={item.id} item={item} onClick={setSelectedItem} viewMode={itemsViewMode} />
              ))}
            </div>
          )
        ) : (
          <div
            key={itemsAnimationKey}
            className={`flex flex-col items-center justify-center gap-3 py-16 text-center text-muted ${isViewTransitioning ? 'translate-y-1.5 opacity-0' : 'animate-items-up'}`}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            <p>No items found in this category.</p>
          </div>
        )}
      </section>

      {selectedItem && (
        <ItemModal item={selectedItem} menuId={menuId} onClose={() => setSelectedItem(null)} />
      )}
    </>
  );
}
