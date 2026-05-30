import type { Metadata } from 'next';
import './globals.css';
import './responsive.css';

export const metadata: Metadata = {
  title: 'RestoQR | Digital Menu Platform',
  description: 'Discover restaurants and open modern digital menus instantly.',
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

import { ThemeProvider } from '../components/ThemeProvider';
import RouteLoader from '../components/RouteLoader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('resto-theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <RouteLoader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
