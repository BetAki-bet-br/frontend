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
| `agecap.svg`       | `assets.ageBadge` | SVG, 1:1        | 68×68          | "+18" badge on the auth pages, wallet deposit/withdrawal, e-mail confirmation |

### `icons/` — chrome painted in the brand accent

The eight files in `icons/` are the small pieces of chrome whose accent colour is baked into the
file itself. They are addressed by `assets.icons.*` and served from `/assets/brand/icons/`.

| File                | `brand.config.ts`               | Used by                                                     |
| ------------------- | ------------------------------- | ----------------------------------------------------------- |
| `ball-icon.svg`     | `assets.icons.navHome`          | mobile bottom nav (home pill), mobile sidebar                |
| `bet-coin.svg`      | `assets.icons.navLiveActive`    | mobile bottom nav "Ao Vivo" (active), mobile sidebar         |
| `deposit-icon.svg`  | `assets.icons.navDepositActive` | mobile bottom nav "Depositar" (active)                       |
| `live-icon.svg`     | `assets.icons.liveBadge`        | "Ao vivo" badge on live game cards                           |
| `chat-icon.svg`     | `assets.icons.support`          | footer "Contate-nos" button, and `static/footer.html`        |
| `search-icon.svg`   | `assets.icons.search`           | casino and live search pages                                 |
| `arrow-left.svg`    | `assets.icons.arrowLeft`        | "Voltar" chevron on the lobby's game rows                    |
| `arrow-right.svg`   | `assets.icons.arrowRight`       | "Ver todos" chevron on the lobby's game rows                 |

The copies shipped in this template have the same geometry as the betaki originals but are painted
in the placeholder magenta `#A21CAF` (and its shades `#831693` / `#5C0F68`), the same convention as
the `--color-brand-*` ramp of `brand-theme.scss`: **while these icons are magenta the brand has not
been themed.** Recolour them to the brand accent — the lime family in the betaki copies maps as
`#BCD200`/`#C6D42D` → accent, `#A6B224` and `#8FA000` → one step darker, `#697505` → the darkest
gradient stop. Leave the greys (`#EAEAEA`, `#E1E1E4`, `#F1F1F1`, `#17171A`, `#3C3A41`, `#CCCCCC`)
alone: they are the roulette wheel and the coin, not brand colour.

The white/neutral variants of the same icons (`bet-icon-white.svg`, `deposit-icon-white.svg`,
`ball-icon-white.svg`, `menu-icon.svg`, …) stay shared in `src/assets/icons` — they carry no brand
colour.

Notes:

- `logo.png` is the only raster logo. It also backs the SCSS variable `$brand-logo-url` in
  `brand-variables.scss` (the sportsbook preload background), which stylesheets cannot read from
  the TypeScript config — keep the two in sync.
- `logo-mobile.webp` is loaded on every game card, so keep it small.
- `logo-white.svg` also needs its intrinsic size in `assets.logoSize` (`{ width, height }`): the
  header renders it through `NgOptimizedImage`, which warns when the declared aspect ratio does not
  match the file. Copy the numbers off the SVG's own `width`/`height`.
- `agecap.svg` is the responsible-gaming badge. Recolour the three lime `#BCD200` fills in the
  betaki copy to the brand's own accent — it sits on `--color-surface-auth`, so it must read on a
  light background.
- The white and the colour logo are rendered on dark surfaces; make sure they stay legible on
  `--color-shark-950`.
- SVGs are served as-is (no sanitising step), so strip editor metadata and any `id` that names the
  brand before committing.

## Optional

Extra variants the betaki package carries and that a brand may want: `logo-black.svg`,
`logo-black-color.svg`, `logo-green.svg` (a coloured logo for light surfaces), `icon-outline.svg`.
They are not referenced by `brand.config.ts`; add a field to `BrandConfig` if a component needs one.
