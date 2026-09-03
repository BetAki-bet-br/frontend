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
| `assets/*` | Hand-drawn wordmark (`Giros` + italic `BET`) and a geometric `G` monogram. The wordmark is `<text>`-based, so it renders in whatever grotesque the viewer has when the SVG is loaded through `<img>` — it is **not** outlined type. | Official vector logo kit (wordmark, monogram, favicon, mascot). |
| `legal/*` | Eight fragments with "Conteúdo legal da GirosBet — a fornecer". BetAki's legal text was deliberately **not** copied. | T&C, privacy, AML, responsible gaming, sportsbook annex, contact, support, ouvidoria. |
| `brand.config.ts` → `ids.*`, `api.*`, `integrations.tawkToSDK`, `integrations.legitimuzSDKToken` | BetAki's **development** values, each marked `TODO(girosbet)`. Kept on purpose so the demo build renders real CMS content instead of empty carousels. | A GirosBet backoffice instance: brand/portal ids, API key, CMS slug postfix, thumbnail and CMS CDN roots, chat and KYC tokens. |
| `brand.config.ts` → `legal.disclaimer`, `legal.supportEmail` | Neutral placeholder paragraph. | The regulatory paragraph (operator, CNPJ, address, SPA/MF authorisation) and the real mailbox. |
| `brand.config.ts` → `social.*`, `integrations.gtmId`, `integrations.sportsbook`, `integrations.affiliatePixel` | All `undefined`; the footer drops the social icons and no tag manager is injected. | Social profiles, GTM container, sportsbook aggregator (Altenar or other), affiliate pixel. |
| `features.highlightedMenuLabels` | Empty. | The loyalty-club menu label, once the backoffice menus exist. |

`assets/README.md` and `legal/README.md` from `brands/_template` were removed as the how-to
instructs: every file under `assets/` and `legal/` is copied verbatim into `dist/girosbet/browser`,
so brand-level notes belong here, at the package root, which the build does not copy.

## Regenerating the placeholder artwork

The SVGs were produced by hand; `logo.png` (480×128), `logo-mobile.webp` (240×64) and
`favicon.png` (64×64) are Puppeteer renders of `logo-white-color.svg` and `icon-green.svg` with
Inter loaded from Google Fonts. Replace all of them together when the real kit lands, and keep
`assets.logo` in `brand.config.ts` and `$brand-logo-url` in `brand-variables.scss` pointing at the
same file.
