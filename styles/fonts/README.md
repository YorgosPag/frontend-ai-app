# Self-Hosted Fonts

This directory is intended for storing self-hosted font files (e.g., `.woff2` format).

When adding custom fonts:
1. Place the font files (e.g., `inter.woff2`, `merriweather.woff2`) directly in this `styles/fonts/` directory.
2. Define the corresponding `@font-face` rules. These rules would typically reside in a CSS file within the `styles/typography/` directory (e.g., in `tokens.css` or a dedicated `fonts.css`).

Example `@font-face` rule structure:
```css
/* In styles/typography/tokens.css or a new styles/typography/fonts.css */

/* @font-face {
  font-family: 'YourFontName';
  src: url('../fonts/yourfontfile.woff2') format('woff2'); /* Path relative to the CSS file */
  font-weight: 400; /* or normal, bold, etc. */
  font-style: normal; /* or italic */
  font-display: swap; /* Recommended for performance */
} */
```

This setup prepares the application for easy integration of custom, self-hosted fonts, improving performance and control over font assets.
