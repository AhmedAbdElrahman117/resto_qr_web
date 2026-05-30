import { fetchItemsByCategory } from '../../../lib/data/items';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/items?categoryId=xxx
 * Called by the CategoryTabs client component for lazy per-tab item loading.
 */
export async function GET(req: NextRequest) {
  const categoryId = req.nextUrl.searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json({ error: 'Missing categoryId' }, { status: 400 });
  }

  try {
    let items;
    // Inject Mock Data
    if (categoryId.startsWith('category-mock-')) {
      const { getMockItems } = await import('../../../lib/data/mock');
      items = getMockItems(categoryId);
    } else {
      items = await fetchItemsByCategory(categoryId);
    }
    return NextResponse.json(items);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
