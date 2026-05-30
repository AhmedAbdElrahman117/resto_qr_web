import { NextResponse } from 'next/server';

import { fetchMenuWithRestaurant } from '../../../../lib/data/menu';

export async function GET(
    req: Request,
    { params }: { params: { menuId: string } }
) {
    try {
        const { restaurant } = await fetchMenuWithRestaurant(params.menuId);
        const logoUrl = restaurant.restaurant_logo_url;

        if (!logoUrl) {
            return NextResponse.redirect(new URL('/favicon.ico', req.url));
        }

        const response = await fetch(logoUrl, { next: { revalidate: 3600 } });
        if (!response.ok) {
            return NextResponse.redirect(new URL('/favicon.ico', req.url));
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const body = await response.arrayBuffer();

        return new Response(body, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch {
        return NextResponse.redirect(new URL('/favicon.ico', req.url));
    }
}
