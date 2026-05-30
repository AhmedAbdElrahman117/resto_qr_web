import Image from 'next/image';

import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Restaurant } from '@/lib/types';
import DarkModeToggle from '@/components/DarkModeToggle';
import RestaurantCardLink from '@/components/RestaurantCardLink';
import ContactForm from '@/components/ContactForm';
import AnimatedStat from '@/components/AnimatedStat';
import RevealOnScroll from '@/components/RevealOnScroll';

type RestaurantMenu = {
  menuId: string;
  restaurant: Restaurant;
};

async function fetchRestaurantMenus(): Promise<RestaurantMenu[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from('menus')
    .select(`
      id,
      restaurants (
        id,
        owner_id,
        restaurant_name,
        restaurant_address,
        restaurant_logo_url,
        restaurant_description,
        menu_url,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load restaurants:', error.message);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const raw = (row as { restaurants?: Restaurant | Restaurant[] | null }).restaurants;
      const restaurant = Array.isArray(raw) ? raw[0] : raw ?? null;
      if (!restaurant) return null;
      return { menuId: row.id as string, restaurant };
    })
    .filter(Boolean) as RestaurantMenu[];
}

export default async function Home() {
  const restaurants = await fetchRestaurantMenus();

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <RevealOnScroll delayMs={0}>
        <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="RestoQR logo" width={38} height={38} priority />
              <div className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight text-foreground">RestoQR</span>
                <span className="text-xs text-muted">Digital menu platform</span>
              </div>
            </div>
            <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
              <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#restaurants">Restaurants</a>
              <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#how">How it works</a>
              <a className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground" href="#support">Support</a>
            </nav>
            <DarkModeToggle />
          </div>
        </header>
      </RevealOnScroll>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="grid gap-8 py-12 lg:grid-cols-2 lg:items-center lg:py-20">
          <RevealOnScroll delayMs={200}>
            <div className="flex flex-col gap-5">
              <span className="inline-flex w-fit items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                Digital menus
              </span>
              <h1 className="text-pretty text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
                Modern menus, instantly accessible.
              </h1>
              <p className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
                RestoQR helps guests discover restaurants and open menus in seconds while
                restaurants keep branding and updates effortless.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-95"
                  href="#restaurants"
                >
                  Browse restaurants
                </a>
                <span className="text-sm text-muted">{restaurants.length} live menus</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4 border-t border-border pt-6">
                <AnimatedStat value={restaurants.length} label="Restaurants" delayMs={600} />
                <AnimatedStat value="QR ready" label="Instant access" delayMs={800} />
                <AnimatedStat value="Live updates" label="Always current" delayMs={1000} />
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={400}>
            <div className="rounded-card border border-border bg-surface p-7 shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Why RestoQR</p>
              <h3 className="mt-2 text-2xl font-bold text-foreground">A polished menu experience</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {[
                  'Open menus instantly without app installs.',
                  'Explore categories, offers, and best sellers.',
                  'Designed for clarity, speed, and comfort.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">
                Tap a restaurant below to start.
              </div>
            </div>
          </RevealOnScroll>
        </section>

        {/* How it works */}
        <section id="how" className="py-12">
          <RevealOnScroll>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">How it works</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
                From discovery to menu in seconds
              </h2>
            </div>
          </RevealOnScroll>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { i: '01', t: 'Find a restaurant', d: 'Browse curated restaurants or scan a QR code on-site.' },
              { i: '02', t: 'Open the menu', d: 'Menus load instantly with categories, offers, and best sellers.' },
              { i: '03', t: 'Stay updated', d: 'Restaurants update menus in real time without reprinting.' },
            ].map((step, idx) => (
              <RevealOnScroll key={step.i} delayMs={(idx + 1) * 100}>
                <article className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-6 shadow-sm">
                  <span className="text-2xl font-extrabold text-primary/40">{step.i}</span>
                  <h3 className="text-lg font-bold text-foreground">{step.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* Restaurants */}
        <section id="restaurants" className="py-12">
          <RevealOnScroll>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Restaurants</p>
                <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Choose a restaurant</h2>
              </div>
              <span className="text-sm text-muted">{restaurants.length} available</span>
            </div>
          </RevealOnScroll>

          {restaurants.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map(({ menuId, restaurant }, index) => (
                <RevealOnScroll key={menuId} delayMs={(index % 4) * 100}>
                  <RestaurantCardLink menuId={menuId} restaurant={restaurant} delayMs={0} />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-dashed border-border bg-surface px-6 py-16 text-center text-muted">
              <p>No restaurants are available yet.</p>
            </div>
          )}
        </section>

        {/* Contact */}
        <section id="contact" className="py-12">
          <RevealOnScroll>
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Get in Touch</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">Contact Us</h2>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delayMs={200}>
            <ContactForm />
          </RevealOnScroll>
        </section>
      </main>

      {/* Footer */}
      <RevealOnScroll delayMs={100}>
        <footer id="support" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="flex flex-col justify-between gap-8 sm:flex-row">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="RestoQR logo" width={36} height={36} />
                <div className="flex flex-col leading-tight">
                  <span className="text-base font-extrabold tracking-tight text-foreground">RestoQR</span>
                  <span className="text-xs text-muted">Digital menu platform</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-foreground">Contact</span>
                  <a className="text-sm text-muted-foreground transition-colors hover:text-primary" href="mailto:support@restoqr.app">
                    support@restoqr.app
                  </a>
                  <span className="text-xs text-muted">Support email placeholder</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-bold text-foreground">Explore</span>
                  <a className="text-sm text-muted-foreground transition-colors hover:text-primary" href="#restaurants">Restaurants</a>
                  <a className="text-sm text-muted-foreground transition-colors hover:text-primary" href="#how">How it works</a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-border pt-6 sm:flex-row">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <span className="text-sm text-muted-foreground">© 2026 RestoQR. All rights reserved.</span>
                <span className="text-xs text-muted">Built for modern dining rooms.</span>
              </div>
              <div className="flex flex-col items-center gap-3 sm:items-end">
                <p className="text-[0.85rem] text-muted-foreground">
                  Powered by <span className="font-extrabold text-muted">RestoQR</span>
                </p>
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-border bg-background px-5 py-2.5 text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                  aria-label="Download RestoQR on Google Play"
                >
                  <svg className="shrink-0 text-foreground" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M3.18 23.5c.37.21.79.21 1.16.01l14.75-8.5-3.14-3.14L3.18 23.5zm-1.18-21v19c0 .45.25.84.62 1.05l12.38-12.38L2.62 1.45A1.17 1.17 0 0 0 2 2.5zM20.75 10.5l-2.97-1.71-3.37 3.38 3.37 3.37 2.99-1.72c.85-.49.85-1.83-.02-2.32zm-17.57-8L16.93 10l-3.14-3.14L3.18 1.5z" />
                  </svg>
                  <span className="flex flex-col gap-px">
                    <span className="text-[0.7rem] font-normal leading-none text-muted">Get it on</span>
                    <span className="text-base font-bold leading-none text-foreground">Google Play</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
    </div>
  );
}
