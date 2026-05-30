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
    <div className="landing-shell">
      <div className="landing-bubbles" aria-hidden="true">
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
        <span className="landing-bubble" />
      </div>
      <RevealOnScroll delayMs={0}>
        <div className="landing-topbar">
          <div className="landing-brand">
            <Image
              src="/logo.svg"
              alt="RestoQR logo"
              width={38}
              height={38}
              className="landing-brand-logo"
              priority
            />
            <div className="landing-brand-text">
              <span className="landing-brand-name">RestoQR</span>
              <span className="landing-brand-tag">Digital menu platform</span>
            </div>
          </div>
          <nav className="landing-nav" aria-label="Primary">
            <a className="landing-nav-link" href="#restaurants">Restaurants</a>
            <a className="landing-nav-link" href="#how">How it works</a>
            <a className="landing-nav-link" href="#support">Support</a>
          </nav>
          <div className="landing-topbar-actions">
            <DarkModeToggle />
          </div>
        </div>
      </RevealOnScroll>

      <main className="landing-main">
        <section className="landing-hero">
          <RevealOnScroll delayMs={200}>
            <div className="landing-hero-text">
              <span className="landing-pill">Digital menus</span>
              <h1 className="landing-title">Modern menus, instantly accessible.</h1>
              <p className="landing-subtitle">
                RestoQR helps guests discover restaurants and open menus in seconds while
                restaurants keep branding and updates effortless.
              </p>
              <div className="landing-actions">
                <a className="landing-primary" href="#restaurants">Browse restaurants</a>
                <span className="landing-meta">{restaurants.length} live menus</span>
              </div>
              <div className="landing-metrics">
                <AnimatedStat value={restaurants.length} label="Restaurants" delayMs={600} />
                <AnimatedStat value="QR ready" label="Instant access" delayMs={800} />
                <AnimatedStat value="Live updates" label="Always current" delayMs={1000} />
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={400}>
            <div className="landing-hero-card">
              <p className="landing-card-eyebrow">Why RestoQR</p>
              <h3 className="landing-card-title">A polished menu experience</h3>
              <ul className="landing-card-list">
                <li>
                  <span className="landing-dot" aria-hidden="true" />
                  Open menus instantly without app installs.
                </li>
                <li>
                  <span className="landing-dot" aria-hidden="true" />
                  Explore categories, offers, and best sellers.
                </li>
                <li>
                  <span className="landing-dot" aria-hidden="true" />
                  Designed for clarity, speed, and comfort.
                </li>
              </ul>
              <div className="landing-card-footer">Tap a restaurant below to start.</div>
            </div>
          </RevealOnScroll>
        </section>

        <section id="how" className="landing-section landing-highlights">
          <RevealOnScroll>
            <div className="landing-section-header">
              <div className="landing-section-title-wrap">
                <p className="landing-section-kicker">How it works</p>
                <h2 className="landing-section-title">From discovery to menu in seconds</h2>
              </div>
            </div>
          </RevealOnScroll>
          <div className="landing-highlight-grid">
            <RevealOnScroll delayMs={100}>
              <article className="landing-highlight-card">
                <span className="landing-highlight-index">01</span>
                <h3 className="landing-highlight-title">Find a restaurant</h3>
                <p className="landing-highlight-text">
                  Browse curated restaurants or scan a QR code on-site.
                </p>
              </article>
            </RevealOnScroll>
            <RevealOnScroll delayMs={200}>
              <article className="landing-highlight-card">
                <span className="landing-highlight-index">02</span>
                <h3 className="landing-highlight-title">Open the menu</h3>
                <p className="landing-highlight-text">
                  Menus load instantly with categories, offers, and best sellers.
                </p>
              </article>
            </RevealOnScroll>
            <RevealOnScroll delayMs={300}>
              <article className="landing-highlight-card">
                <span className="landing-highlight-index">03</span>
                <h3 className="landing-highlight-title">Stay updated</h3>
                <p className="landing-highlight-text">
                  Restaurants update menus in real time without reprinting.
                </p>
              </article>
            </RevealOnScroll>
          </div>
        </section>

        <section id="restaurants" className="landing-section">
          <RevealOnScroll>
            <div className="landing-section-header">
              <div className="landing-section-title-wrap">
                <p className="landing-section-kicker">Restaurants</p>
                <h2 className="landing-section-title">Choose a restaurant</h2>
              </div>
              <span className="landing-count">{restaurants.length} available</span>
            </div>
          </RevealOnScroll>

          {restaurants.length > 0 ? (
            <div className="landing-grid">
              {restaurants.map(({ menuId, restaurant }, index) => (
                <RevealOnScroll key={menuId} delayMs={(index % 4) * 100}>
                  <RestaurantCardLink
                    menuId={menuId}
                    restaurant={restaurant}
                    delayMs={0}
                  />
                </RevealOnScroll>
              ))}
            </div>
          ) : (
            <div className="landing-empty">
              <p>No restaurants are available yet.</p>
            </div>
          )}
        </section>

        <section id="contact" className="landing-section">
          <RevealOnScroll>
            <div className="landing-section-header">
              <div className="landing-section-title-wrap">
                <p className="landing-section-kicker">Get in Touch</p>
                <h2 className="landing-section-title">Contact Us</h2>
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delayMs={200}>
            <ContactForm />
          </RevealOnScroll>
        </section>
      </main>

      <RevealOnScroll delayMs={100}>
        <footer id="support" className="landing-footer">
          <div className="landing-footer-inner">
            <div className="landing-footer-brand">
              <Image
                src="/logo.svg"
                alt="RestoQR logo"
                width={36}
                height={36}
                className="landing-footer-logo"
              />
              <div className="landing-footer-brand-text">
                <span className="landing-footer-name">RestoQR</span>
                <span className="landing-footer-tag">Digital menu platform</span>
              </div>
            </div>
            <div className="landing-footer-links">
              <div className="landing-footer-col">
                <span className="landing-footer-title">Contact</span>
                <a className="landing-footer-link" href="mailto:support@restoqr.app">
                  support@restoqr.app
                </a>
                <span className="landing-footer-note">Support email placeholder</span>
              </div>
              <div className="landing-footer-col">
                <span className="landing-footer-title">Explore</span>
                <a className="landing-footer-link" href="#restaurants">Restaurants</a>
                <a className="landing-footer-link" href="#how">How it works</a>
              </div>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <div className="landing-footer-rights">
              <span>© 2026 RestoQR. All rights reserved.</span>
              <span className="landing-footer-meta">Built for modern dining rooms.</span>
            </div>
            <div className="landing-footer-powered">
              <p className="powered-by-text">
                Powered by <span className="powered-by-brand">RestoQR</span>
              </p>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="google-play-btn landing-play-btn landing-footer-download"
                aria-label="Download RestoQR on Google Play"
              >
                <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M3.18 23.5c.37.21.79.21 1.16.01l14.75-8.5-3.14-3.14L3.18 23.5zm-1.18-21v19c0 .45.25.84.62 1.05l12.38-12.38L2.62 1.45A1.17 1.17 0 0 0 2 2.5zM20.75 10.5l-2.97-1.71-3.37 3.38 3.37 3.37 2.99-1.72c.85-.49.85-1.83-.02-2.32zm-17.57-8L16.93 10l-3.14-3.14L3.18 1.5z" />
                </svg>
                <span className="play-btn-text">
                  <span className="play-btn-sub">Get it on</span>
                  <span className="play-btn-main">Google Play</span>
                </span>
              </a>
            </div>
          </div>
        </footer>
      </RevealOnScroll>
    </div>
  );
}
