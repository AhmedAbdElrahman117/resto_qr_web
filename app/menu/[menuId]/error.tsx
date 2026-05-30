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
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-8 text-center">
      <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-500/10">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mb-6 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground">
        We could not load this menu. Please check your connection and try again.
      </p>
      <button
        onClick={reset}
        className="rounded-xl bg-primary px-7 py-3 text-[0.95rem] font-semibold text-white transition-transform duration-150 hover:brightness-105 active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
