# `brands/<slug>/assets`

Everything in this directory is copied to `/assets/brand` by the brand's `angular.json`
configuration, so a file named `logo-white.svg` is served at `/assets/brand/logo-white.svg`. The
paths in `brand.config.ts` (`assets.*`) are what the components actually read — rename a file here
and rename it there too.

Delete this README in the real brand directory; it exists only to document the expected set.

## Required

| File               | `brand.config.ts` | Format          | Reference size | Used by                                                                  |
| ------------------ | ----------------- | --------------- | -------------- | ------------------------------------------------------------------------ |
| `favicon.png`      | `assets.favicon`  | PNG, square-ish | 64×64          | `index.html` (`<link rel="icon">` and `apple-touch-icon`)                 |
| `logo.png`         | `assets.logo`     | PNG, ~2.7:1     | 303×114        | dialog headers, maintenance page, broken-image fallback, sportsbook splash |
| `logo-white.svg`   | `assets.logoWhite`| SVG, ~2.7:1     | 303×114        | desktop header, mobile sidebar                                            |
| `logo-color.svg`   | `assets.logoColor`| SVG, ~2.7:1     | 303×114        | footer                                                                    |
| `icon.svg`         | `assets.icon`     | SVG, ~1:1       | 211×198        | mobile bottom menu (active state), mobile sidebar                         |
| `logo-mobile.webp` | `assets.logoMobile`| WebP, wordmark | ≤ 4 KB         | mobile header, game-card placeholder while the thumbnail loads            |

Notes:

- `logo.png` is the only raster logo. It also backs the SCSS variable `$brand-logo-url` in
  `brand-variables.scss` (the sportsbook preload background), which stylesheets cannot read from
  the TypeScript config — keep the two in sync.
- `logo-mobile.webp` is loaded on every game card, so keep it small.
- The white and the colour logo are rendered on dark surfaces; make sure they stay legible on
  `--color-shark-950`.
- SVGs are served as-is (no sanitising step), so strip editor metadata and any `id` that names the
  brand before committing.

## Optional

Extra variants the betaki package carries and that a brand may want: `logo-black.svg`,
`logo-black-color.svg`, `logo-green.svg` (a coloured logo for light surfaces), `icon-outline.svg`.
They are not referenced by `brand.config.ts`; add a field to `BrandConfig` if a component needs one.
