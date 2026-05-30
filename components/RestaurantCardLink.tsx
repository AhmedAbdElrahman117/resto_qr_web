'use client';

import Image from 'next/image';
import Link from 'next/link';

import type { Restaurant } from '@/lib/types';

const NAV_EVENT = 'resto:navigation-start';
const NAV_SOURCE_KEY = 'resto:nav-source';

interface Props {
    menuId: string;
    restaurant: Restaurant;
    delayMs: number;
}

export default function RestaurantCardLink({ menuId, restaurant }: Props) {
    const initial = restaurant.restaurant_name?.charAt(0) ?? '?';

    const handleClick = () => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(NAV_SOURCE_KEY, 'landing');
            } catch {
                // Ignore storage errors (privacy mode, disabled storage, etc.)
            }
            window.dispatchEvent(new CustomEvent(NAV_EVENT));
        }
    };

    return (
        <Link
            href={`/menu/${menuId}`}
            className="group flex h-full items-start gap-4 rounded-card border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
            onClick={handleClick}
            aria-label={`Open menu for ${restaurant.restaurant_name}`}
        >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-background">
                {restaurant.restaurant_logo_url ? (
                    <Image
                        src={restaurant.restaurant_logo_url}
                        alt={`${restaurant.restaurant_name} logo`}
                        fill
                        sizes="56px"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary text-xl font-bold text-white">
                        {initial}
                    </div>
                )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="truncate text-base font-bold text-foreground">{restaurant.restaurant_name}</h3>
                {restaurant.restaurant_description && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {restaurant.restaurant_description}
                    </p>
                )}
                <div className="mt-1 flex flex-col gap-1.5">
                    {restaurant.restaurant_address && (
                        <span className="truncate text-xs text-muted">{restaurant.restaurant_address}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        View menu
                        <svg
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </span>
                </div>
            </div>
        </Link>
    );
}
