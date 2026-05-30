import type { Banner, Category, CategoryWithItems, MenuItem } from '../types';

export function getMockBanners(menuId: string): Banner[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `banner-mock-${i}`,
    menu_id: menuId,
    image_url: `https://picsum.photos/seed/banner${i}/800/400`,
    redirect_url: null,
    is_live: true,
    interactions: 0,
    expires_at: null,
    created_at: new Date().toISOString(),
  }));
}

export function getMockCategories(menuId: string): Category[] {
  return Array.from({ length: 15 }).map((_, i) => {
    // Generate a random count between 5 and 45 based on the index to be deterministic
    const itemsCount = 5 + ((i * 7) % 41);
    return {
      id: `category-mock-${i}`,
      menu_id: menuId,
      name: `Category ${i + 1}`,
      image_url: `https://picsum.photos/seed/category${i}/100/100`,
      items_count: itemsCount,
      is_visible: true,
      created_at: new Date().toISOString(),
    };
  });
}

export function getMockCategoriesWithItems(menuId: string): CategoryWithItems[] {
  return getMockCategories(menuId).map((category) => ({
    ...category,
    items: getMockItems(category.id),
  }));
}

export function getMockItems(categoryId: string): MenuItem[] {
  // Extract index from categoryId to determine how many items to generate
  const match = categoryId.match(/category-mock-(\d+)/);
  const index = match ? parseInt(match[1], 10) : 0;
  const itemsCount = 5 + ((index * 7) % 41);

  return Array.from({ length: itemsCount }).map((_, i) => {
    const discountPercent = i % 4 === 0 ? String(10 + ((index + i) % 3) * 5) : null;
    return {
      id: `item-mock-${index}-${i}`,
      category_id: categoryId,
      restaurant_id: 'mock-restaurant-id',
      owner_id: 'mock-owner-id',
      name: `Delicious Item ${i + 1}`,
      description: `This is a wonderful mock description for Delicious Item ${i + 1}.`,
      price: ((Math.random() * 20) + 5).toFixed(2),
      discount: discountPercent,
      image_urls: [`https://picsum.photos/seed/item${index}${i}/400/400`],
      is_visible: true,
      views_count: 0,
      expires_at: null,
      created_at: new Date().toISOString(),
    };
  });
}
