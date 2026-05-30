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
        className="route-loader is-active"
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

  return (
    <div className="page-skeleton page-enter">
      {/* Header skeleton */}
      <div className="page-skeleton-header" />

      {/* Banner skeleton */}
      <div style={{ padding: '20px 16px 0' }}>
        <div className="skeleton" style={{ width: '100%', height: '160px', borderRadius: '12px' }} />
      </div>

      {/* Tabs skeleton */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 16px',
        borderBottom: '1px solid #e2e8f0',
        marginTop: '8px',
      }}>
        {[80, 110, 70, 95, 85].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: w, height: 36, borderRadius: '99px', flexShrink: 0 }}
          />
        ))}
      </div>

      {/* Items grid skeleton */}
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton skeleton-title" style={{ width: 140, marginBottom: 16 }} />
        <div className="skeleton-items-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonItemCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonItemCard() {
  return (
    <div className="skeleton-item-card">
      {/* Image area */}
      <div className="skeleton" style={{ width: '100%', aspectRatio: '4/3' }} />
      {/* Body */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton skeleton-title" style={{ width: '80%' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%' }} />
        <div className="skeleton skeleton-text" style={{ width: '65%' }} />
        <div style={{ marginTop: '4px' }}>
          <div className="skeleton skeleton-title" style={{ width: '45%' }} />
        </div>
      </div>
    </div>
  );
}
