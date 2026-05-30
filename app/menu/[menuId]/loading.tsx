"use client";

import { useEffect, useMemo } from 'react';

const NAV_SOURCE_KEY = 'resto:nav-source';

export default function Loading() {
  const showScreenLoader = useMemo(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      return sessionStorage.getItem(NAV_SOURCE_KEY) === 'landing';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!showScreenLoader) {
      return;
    }
    try {
      sessionStorage.removeItem(NAV_SOURCE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, [showScreenLoader]);

  if (showScreenLoader) {
    return (
      <div
        className="fixed inset-0 z-[9999] grid place-items-center bg-[rgba(15,23,42,0.16)] backdrop-blur-[6px] dark:bg-black/50"
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

  return (
    <div className="animate-page-enter min-h-dvh bg-background">
      {/* Header skeleton */}
      <div className="h-[60px] border-b border-border bg-surface" />

      {/* Banner skeleton */}
      <div className="px-4 pt-5">
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="mt-2 flex gap-2 border-b border-border px-4 py-4">
        {[80, 110, 70, 95, 85].map((w, i) => (
          <div
            key={i}
            className="skeleton h-9 shrink-0 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Items list skeleton */}
      <div className="px-4 py-5">
        <div className="skeleton mb-4 h-6 w-36" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonItemRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonItemRow() {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <div className="flex flex-1 flex-col gap-2">
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-[65%]" />
        <div className="skeleton mt-1 h-5 w-[45%]" />
      </div>
      <div className="skeleton h-[90px] w-[90px] shrink-0 rounded-xl" />
    </div>
  );
}
