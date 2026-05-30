'use client';

import { useState, useEffect, useRef } from 'react';
import type { CategoryWithItems, MenuItem } from '../lib/types';
import ItemCard from './ItemCard';
import ItemModal from './ItemModal';
import Image from 'next/image';

interface Props {
  categories: CategoryWithItems[];
  menuId: string;
}

type ItemsViewMode = 'list' | 'grid';

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
  const [canScrollRight, setCanScrollRight] = useState(true); // default true assuming more tabs exist initially

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Adding a small 2px threshold to avoid rounding issues
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
      const scrollAmount = direction === 'left' ? -(clientWidth / 2) : (clientWidth / 2);
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Center the active tab on click
  const handleTabClick = (categoryId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (categoryId !== activeCategoryId) {
      setAnimateNonce(prev => prev + 1);
      setActiveCategoryId(categoryId);
    }
    const tabElement = event.currentTarget;
    if (tabsRef.current) {
      const container = tabsRef.current;
      const scrollLeft = tabElement.offsetLeft - (container.offsetWidth / 2) + (tabElement.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    // Scroll window back to the beginning of the items list
    if (sectionRef.current && navWrapperRef.current) {
      const headerOffset = 68; // The fixed top nav height
      const navWrapperHeight = navWrapperRef.current.offsetHeight;
      const y = sectionRef.current.getBoundingClientRect().top + window.scrollY - headerOffset - navWrapperHeight;

      // Only scroll if we are past the section (i.e. user scrolled down)
      // or we can just strictly scroll to it every time.
      // Usually users expect it to snap back to top of the items
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  const currentCategory = categoriesWithAll.find((category) => category.id === activeCategoryId);
  const isAllCategory = activeCategoryId === allCategoryId;
  const currentItems: MenuItem[] = isAllCategory
    ? allItems
    : (currentCategory?.items ?? []);
  const mostViewedItems: MenuItem[] = isAllCategory
    ? [...allItems]
      .sort((a, b) => Number(b.views_count) - Number(a.views_count))
      .slice(0, 7)
    : [];
  const discountedItems: MenuItem[] = isAllCategory
    ? discountedItemsAll
    : [];
  const allSections = isAllCategory
    ? [
      {
        id: 'most-viewed',
        title: 'Most Viewed',
        items: mostViewedItems,
      },
      {
        id: 'discounts',
        title: 'Discounts',
        items: discountedItems,
      },
      ...categories.map((category) => ({
        id: category.id,
        title: category.name,
        items: category.items ?? [],
      })),
    ].filter((section) => section.items.length > 0)
    : [];
  const itemsAnimationKey = `items-${activeCategoryId}-${animateNonce}`;
  const listClassName = `item-list ${isViewTransitioning ? 'view-transition' : 'animate-items'}`;
  const emptyClassName = `empty-state ${isViewTransitioning ? 'view-transition' : 'animate-items'}`;

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

  return (
    <>
      <div className="nav-wrapper" ref={navWrapperRef}>
        <div className="nav-scroll-container">
          {canScrollLeft && (
            <button
              className="nav-scroll-arrow nav-scroll-left"
              onClick={() => scrollBy('left')}
              aria-label="Scroll left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <div className="nav-scroll" ref={tabsRef} role="tablist">
            {categoriesWithAll.map((category) => (
              <button
                key={category.id}
                role="tab"
                aria-selected={activeCategoryId === category.id}
                className={`nav-tab ${activeCategoryId === category.id ? 'active' : ''}`}
                onClick={(e) => handleTabClick(category.id, e)}
              >
                <span className="nav-tab-icon">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt=""
                      width={28}
                      height={28}
                      className="nav-tab-img"
                    />
                  ) : (
                    <span className="nav-tab-letter">
                      {category.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span className="nav-tab-label">{category.name}</span>
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              className="nav-scroll-arrow nav-scroll-right"
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

      <section className="menu-section" ref={sectionRef}>
        <div className="items-view-toggle" role="group" aria-label="Items view">
          <button
            type="button"
            data-view="list"
            className={`view-toggle-btn ${itemsViewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewChange('list')}
            aria-pressed={itemsViewMode === 'list'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <circle cx="4" cy="6" r="1.5" />
              <circle cx="4" cy="12" r="1.5" />
              <circle cx="4" cy="18" r="1.5" />
            </svg>
            <span>List</span>
          </button>
          <button
            type="button"
            data-view="grid"
            className={`view-toggle-btn ${itemsViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleViewChange('grid')}
            aria-pressed={itemsViewMode === 'grid'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <rect x="13" y="13" width="8" height="8" rx="1" />
            </svg>
            <span>Grid</span>
          </button>
        </div>
        {currentItems.length > 0 ? (
          isAllCategory ? (
            <div
              className={`all-sections ${isViewTransitioning ? 'view-transition' : 'animate-items'}`}
              key={itemsAnimationKey}
            >
              {allSections.map((section) => (
                <div key={section.id} className="all-section">
                  <p className="all-section-label">{section.title}</p>
                  <div className={`all-section-items ${listClassName}`}>
                    {section.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onClick={setSelectedItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={listClassName}
              key={itemsAnimationKey}
            >
              {currentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={setSelectedItem}
                />
              ))}
            </div>
          )
        ) : (
          <div className={emptyClassName} key={itemsAnimationKey}>
            <div className="empty-state-icon">📝</div>
            <p>No items found in this category.</p>
          </div>
        )}
      </section>

      {/* Item Details Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          menuId={menuId}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
