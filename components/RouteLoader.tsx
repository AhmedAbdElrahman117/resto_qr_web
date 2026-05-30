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
            className={[
                'fixed inset-0 z-[9999] grid place-items-center bg-[rgba(15,23,42,0.16)] backdrop-blur-[6px] transition-[opacity,visibility] duration-150 dark:bg-black/50',
                active ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0',
            ].join(' ')}
            role="status"
            aria-live="polite"
            aria-label="Loading"
        >
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-[18px] py-3.5 font-semibold text-foreground shadow-md">
                <span className="h-[22px] w-[22px] animate-spin rounded-full border-[3px] border-primary-500/20 border-t-primary" aria-hidden="true" />
                <span className="text-[0.9rem]">Loading menu...</span>
            </div>
        </div>
    );
}
