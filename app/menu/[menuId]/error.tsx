'use client';

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
        Something went wrong
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 360, lineHeight: 1.6, marginBottom: 24 }}>
        We could not load this menu. Please check your connection and try again.
      </p>
      <button
        onClick={reset}
        style={{
          background: 'var(--color-primary, #0ea5e9)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 28px',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
