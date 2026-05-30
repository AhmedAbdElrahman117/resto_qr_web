/**
 * Parses Flutter's #AARRGGBB hex color format into a CSS-compatible rgba() string.
 *
 * Flutter stores colors via Color.toARGB32().toRadixString(16), producing:
 *   #AARRGGBB  (alpha is the FIRST byte)
 *
 * CSS rgba() expects:  rgba(r, g, b, a)  where a is 0..1
 *
 * Example: '#FF0EA5E9' → 'rgba(14,165,233,1)'
 */
export function parseFlutterHex(hex: string): string {
  // Strip leading '#'
  const clean = hex.replace(/^#/, '');

  let a = 255, r = 0, g = 0, b = 0;

  if (clean.length === 8) {
    // #AARRGGBB
    a = parseInt(clean.slice(0, 2), 16);
    r = parseInt(clean.slice(2, 4), 16);
    g = parseInt(clean.slice(4, 6), 16);
    b = parseInt(clean.slice(6, 8), 16);
  } else if (clean.length === 6) {
    // #RRGGBB — treat as fully opaque
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  }

  const alpha = +(a / 255).toFixed(3);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Converts a Flutter hex color to a plain #RRGGBB string (drops alpha),
 * useful for places that need a hex value (e.g. meta theme-color).
 */
export function flutterHexToRgbHex(hex: string): string {
  const clean = hex.replace(/^#/, '');
  if (clean.length === 8) {
    return `#${clean.slice(2)}`; // strip AA prefix
  }
  return `#${clean}`;
}

/**
 * Builds the full CSS custom-property string from a MenuTheme record.
 * This is injected server-side into a <style> tag to avoid FOUC.
 */
export function buildCSSVariables(theme: {
  primary_color: string;
  background_color: string;
  font_family: string;
  card_radius: number;
  card_elevation: number;
}): string {
  const primaryRgba = parseFlutterHex(theme.primary_color);
  const bgRgba = parseFlutterHex(theme.background_color);

  // Derive a lighter/transparent version of primary for hover states
  const primaryWithAlpha = parseFlutterHex(theme.primary_color.replace(/^#../, '#26'));

  return `
    :root:not(.dark) {
      --color-bg: ${bgRgba};
    }
    :root {
      --color-primary: ${primaryRgba};
      --color-primary-soft: ${primaryWithAlpha};
      --font-family: '${theme.font_family}', system-ui, sans-serif;
      --card-radius: ${theme.card_radius}px;
      --card-elevation: ${theme.card_elevation}px;
    }
  `.trim();
}
