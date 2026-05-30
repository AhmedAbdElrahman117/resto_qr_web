'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const NAV_EVENT = 'resto:navigation-start';
const NAV_SOURCE_KEY = 'resto:nav-source';
const MAX_LOADING_MS = 8000;

export default function RouteLoader() {
    const pathname = usePathname();
    const [active, setActive] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const handleStart = () => {
            let fromLanding = false;
            try {
                fromLanding = sessionStorage.getItem(NAV_SOURCE_KEY) === 'landing';
            } catch {
                fromLanding = false;
            }
            if (fromLanding) {
                return;
            }
            setActive(true);
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => {
                setActive(false);
                timeoutRef.current = null;
            }, MAX_LOADING_MS);
        };

        window.addEventListener(NAV_EVENT, handleStart);

        return () => {
            window.removeEventListener(NAV_EVENT, handleStart);
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        setActive(false);
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        try {
            sessionStorage.removeItem(NAV_SOURCE_KEY);
        } catch {
            // Ignore storage errors
        }
    }, [pathname]);

    return (
        <div
            className={`route-loader${active ? ' is-active' : ''}`}
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="route-loader-card">
                <span className="route-loader-spinner" aria-hidden="true" />
                <span className="route-loader-text">Loading menu...</span>
            </div>
        </div>
    );
}
