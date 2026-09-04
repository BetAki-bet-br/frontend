# `brands/girosbet` — placeholder brand package

Everything in this directory is a **placeholder** until the real GirosBet brand kit arrives. It
exists so the white-label mechanism can be demonstrated end to end (`npm run build:girosbet`,
`npm run start:girosbet`) with a second brand that is visibly not BetAki.

The identity was reverse-engineered from the live Next.js site — see
[`docs/girosbet/01-levantamento-marca.md`](../../docs/girosbet/01-levantamento-marca.md).

## What is real

- **Palette and typography.** `brand-theme.scss`, `brand-variables.scss` and
  `material-variables.scss` carry the colours captured from https://www.girosbet.io/
  (`#901bf7` primary, `#e145ff` CTA magenta, `#3c086b` secondary surfaces, `#03000b` background)
  and the brand fonts (Inter for body, Bebas Neue for display).
- **SEO.** Title, description, canonical hostname, `robots.txt` and `sitemap.xml` point at
  `https://www.girosbet.io/`.

## What is a placeholder

| Area | State | Needed from the brand |
| --- | --- | --- |
| `assets/*` | **Wordmark oficial** (`logo-white.png`, `logo-color.png`, `logo-mobile.png`, 500×148, com o selo LOTEP) e `favicon.png` / `apple-touch-icon.png` copiados do site girosbet.io em 03/09/2026 (bucket público do CMS deles). `logo.png` (superfícies claras) é uma **derivação nossa**: o prateado virou `#120026`, o magenta ficou. `icon-green.svg` (monograma `G` para o menu mobile) continua placeholder desenhado à mão. | Kit vetorial oficial (wordmark em SVG, versão para fundo claro, monograma, mascote). |
| `legal/*` | Eight fragments with "Conteúdo legal da GirosBet — a fornecer". BetAki's legal text was deliberately **not** copied. | T&C, privacy, AML, responsible gaming, sportsbook annex, contact, support, ouvidoria. |
| `brand.config.ts` → `ids.*`, `api.*`, `integrations.tawkToSDK`, `integrations.legitimuzSDKToken` | BetAki's **development** values, each marked `TODO(girosbet)`. Kept on purpose so the demo build renders real CMS content instead of empty carousels. | A GirosBet backoffice instance: brand/portal ids, API key, CMS slug postfix, thumbnail and CMS CDN roots, chat and KYC tokens. |
| `brand.config.ts` → `legal.disclaimer`, `legal.supportEmail` | Neutral placeholder paragraph. | The regulatory paragraph (operator, CNPJ, address, SPA/MF authorisation) and the real mailbox. |
| `brand.config.ts` → `social.*`, `integrations.gtmId`, `integrations.sportsbook`, `integrations.affiliatePixel` | All `undefined`; the footer drops the social icons and no tag manager is injected. | Social profiles, GTM container, sportsbook aggregator (Altenar or other), affiliate pixel. |
| `features.highlightedMenuLabels` | Empty. | The loyalty-club menu label, once the backoffice menus exist. |

`assets/README.md` and `legal/README.md` from `brands/_template` were removed as the how-to
instructs: every file under `assets/` and `legal/` is copied verbatim into `dist/girosbet/browser`,
so brand-level notes belong here, at the package root, which the build does not copy.

## Artwork provenance

- `logo-white.png`, `logo-color.png`, `logo-mobile.png`: the header logo of https://www.girosbet.io/
  (500×148 PNG with alpha, includes the LOTEP badge), fetched on 2026-09-03 at the brand's request.
  `assets.logoSize` must stay `{ width: 500, height: 148 }` for `NgOptimizedImage`.
- `favicon.png` (64×64) and `apple-touch-icon.png` (180×180, resized from the site's 512 icon): the
  site's own `<link rel="icon">` files.
- `logo.png`: derived from the wordmark for light surfaces (dialogs, maintenance page): every
  non-magenta pixel above the badge painted `#120026`. Replace with the vector kit's dark version.
- `icon-green.svg` / `agecap.svg`: still hand-drawn placeholders. Keep `assets.logo` in
  `brand.config.ts` and `$brand-logo-url` in `brand-variables.scss` pointing at the same file.
