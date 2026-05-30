import type { Config } from "tailwindcss";

/**
 * ─── RestoQR Tailwind Design System ──────────────────────────────────────────
 *
 * Architectural notes:
 * - `darkMode: 'class'` — dark mode is toggled by adding `.dark` to <html> (see
 *   ThemeProvider). This lets us pair every token with a `dark:` variant.
 * - Brand color: the primary brand color is `sky-500` (rgba(14,165,233,1)), exposed
 *   as the full `primary` numeric scale for static usage (e.g. `bg-primary-500`).
 * - Dynamic theming: each restaurant can override its brand/background color at
 *   runtime. Those overrides are injected server-side as CSS variables
 *   (`--color-primary`, `--color-bg`, ...). The semantic tokens below resolve to
 *   those variables, so `bg-primary` / `bg-background` automatically reflect the
 *   restaurant's saved theme while still defaulting to sky-500 when unset.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand (dynamic-aware) ───────────────────────────────────────────
        // `DEFAULT` + `soft` resolve to the SSR-injected variables so per-restaurant
        // theming works. The numeric scale is the static sky palette for cases that
        // need a fixed brand tint regardless of the active theme.
        primary: {
          DEFAULT: "var(--color-primary)",
          soft: "var(--color-primary-soft)",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          950: "#082f49",
        },
        // ─── Semantic surface / text tokens (theme-aware via CSS vars) ────────
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        foreground: "var(--color-text-primary)",
        muted: {
          DEFAULT: "var(--color-text-secondary)",
          foreground: "var(--color-text-muted)",
        },
        discount: "var(--color-badge-discount)",
      },
      fontFamily: {
        // `sans` reflects the restaurant's selected font (dynamic var) and is used
        // throughout the menu viewer. `display` / `body` are fixed brand fonts for
        // the marketing landing page.
        sans: ["var(--font-family)", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "var(--card-radius)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition: "800px 0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "items-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-down": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.95) translateY(20px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "scale-down": {
          from: { opacity: "1", transform: "scale(1) translateY(0)" },
          to: { opacity: "0", transform: "scale(0.95) translateY(20px)" },
        },
        "image-reveal": {
          from: { opacity: "0", filter: "blur(8px)" },
          to: { opacity: "1", filter: "blur(0)" },
        },
        "bubble-drift": {
          "0%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-40px) translateX(20px)" },
          "100%": { transform: "translateY(0) translateX(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.8s infinite linear",
        "fade-in": "fade-in 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-out": "fade-out 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "page-enter": "fade-in 220ms ease both",
        "items-up": "items-up 700ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards",
        "slide-up": "slide-up 400ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "slide-down": "slide-down 400ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards",
        "scale-up": "scale-up 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-down": "scale-down 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "image-reveal": "image-reveal 600ms ease-out",
        "bubble-drift": "bubble-drift 28s linear infinite",
        spin: "spin 700ms linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
