'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { Restaurant } from '@/lib/types';

const NAV_EVENT = 'resto:navigation-start';
const NAV_SOURCE_KEY = 'resto:nav-source';

interface Props {
    menuId: string;
    restaurant: Restaurant;
    delayMs: number;
}

export default function RestaurantCardLink({ menuId, restaurant, delayMs }: Props) {
    const initial = restaurant.restaurant_name?.charAt(0) ?? '?';
    const cardStyle = {
        '--delay': `${delayMs}ms`,
    } as CSSProperties;

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
            className="landing-restaurant-card"
            style={cardStyle}
            onClick={handleClick}
            aria-label={`Open menu for ${restaurant.restaurant_name}`}
        >
            <div className="landing-restaurant-media">
                {restaurant.restaurant_logo_url ? (
                    <Image
                        src={restaurant.restaurant_logo_url}
                        alt={`${restaurant.restaurant_name} logo`}
                        fill
                        sizes="56px"
                        className="landing-restaurant-logo"
                    />
                ) : (
                    <div className="landing-restaurant-fallback">{initial}</div>
                )}
            </div>
            <div className="landing-restaurant-body">
                <h3 className="landing-restaurant-title">{restaurant.restaurant_name}</h3>
                {restaurant.restaurant_description && (
                    <p className="landing-restaurant-desc">{restaurant.restaurant_description}</p>
                )}
                <div className="landing-restaurant-meta">
                    {restaurant.restaurant_address && (
                        <span className="landing-restaurant-address">{restaurant.restaurant_address}</span>
                    )}
                    <span className="landing-restaurant-cta">
                        View menu
                        <svg
                            className="cta-arrow"
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
