/*
 * Template brand configuration.
 *
 * Copy this whole directory to `brands/<slug>/`, then replace every TODO below. The file is not
 * part of any build: no tsconfig includes `brands/_template`, so it is never compiled and the
 * placeholder values never reach a bundle.
 *
 * See `docs/white-label/02-como-criar-marca.md` for the full checklist.
 */
import { brandEnv } from '@app/@core/brand/brand-env';
import type { BrandConfig } from '@app/@core/brand/brand-config';

/** The `<title>` shown before the router sets a per-route one. Keep it under ~60 characters. */
const SEO_TITLE = 'TODO Brand | TODO tagline';

export const BRAND_CONFIG: BrandConfig = {
  /** Directory name under `brands/`. Must match the angular.json configuration name. */
  slug: 'TODO-slug',
  /** Public name, as players read it. Fills `{{brand}}` in copy and translations. */
  name: 'TODO Brand',
  /** Registered company name. Omit when it is the same as `name`. */
  legalName: 'TODO Ltda',

  seo: {
    // `brandEnv` picks the dev or the prod variant based on `environment.production`.
    title: brandEnv({ dev: `[DEV] ${SEO_TITLE}`, prod: SEO_TITLE }),
    /** Fallback `<meta name="description">`. Also duplicated in `index.html` for crawlers. */
    description: 'TODO one-paragraph description of the brand, 150-160 characters.',
    /** Canonical origin, with a trailing slash. Used to build canonical urls. */
    hostname: 'https://example.com/',
    /** Appended to every route title: `brandTitle('Cassino')` -> `Cassino - <titleSuffix>`. */
    titleSuffix: 'TODO Brand',
  },

  ids: {
    /** CMS brand id used by the portal gateway templates API. Ask the backoffice team. */
    brandId: 0,
    /** Brand id used by the bonus/promotions API. */
    defaultBrandId: 0,
    desktopPortalId: 0,
    mobilePortalId: 0,
    /** Suffix appended to CMS category slugs (`home-<postfix>`). Empty string disables it. */
    cmsSlugPostfix: 'TODO-slug',
  },

  api: {
    /**
     * Laravel backoffice. In production the reverse proxy serves it under `/backoffice`.
     * In development point it at the CMS you run locally — `http://localhost:8080` for the
     * backoffice docker-compose stack (see `docs/white-label/02-como-criar-marca.md`,
     * "Rodando com o CMS local"). That container only allows the `http://localhost:4200`
     * origin, so serve the app on port 4200.
     */
    backofficeApiUrl: brandEnv({ dev: 'http://localhost:8080', prod: '/backoffice' }),
    /** `X-Api-Key` sent to the portal gateway. */
    apiKey: 'TODO-api-key',
    /** Root of the game thumbnail CDN, without a trailing slash. */
    gamesThumbsBaseUrl: 'https://TODO-cdn.example.com/gamethumbnails',
    /** Appended after the thumbnail file name (e.g. a cache-busting query string). */
    gamesThumbsUrlSuffix: '',
    /** CMS/CDN root holding the brand's promotion artwork and provider logos. */
    cmsAssetsBaseUrl: 'https://TODO-cdn.example.com/cmslibrary/TODO-slug',
    /** CDN prefix prepended to local asset paths. Empty string serves them from the app origin. */
    assetsBaseUrl: '',
    assetsPath: '',
    assetsQueryString: '',
  },

  integrations: {
    /** Google Tag Manager container. Omit it and no tag manager is injected at all. */
    gtmId: undefined,
    /** Tawk.to widget url. Omit to ship without live chat. */
    tawkToSDK: undefined,
    fonetalk: undefined,
    legitimuzSDKToken: brandEnv({ dev: 'TODO-dev-token', prod: 'TODO-prod-token' }),
    /** Altenar sportsbook. Omit when the brand ships casino only. */
    sportsbook: undefined,
    affiliatePixel: undefined,
    /** Hours an affiliate deep link stays in local storage. */
    affiliateDataExpiryOffset: 168,
  },

  legal: {
    /** Regulatory paragraph at the bottom of the footer. Plain text, written by the brand. */
    disclaimer: 'TODO regulatory disclaimer: operator, company number, address, licence.',
    /** Mailbox quoted in the privacy / data-portability copy. */
    supportEmail: 'TODO@example.com',
  },

  /** Every network listed here gets an icon in the footer; the ones left out are dropped. */
  /** Footer "tem orgulho em patrocinar" logos. Leave empty to hide the block. */
  sponsors: [],

  social: {
    instagram: undefined,
    tiktok: undefined,
    twitter: undefined,
    telegram: undefined,
    facebook: undefined,
  },

  /** Files from `brands/<slug>/assets`, served under `/assets/brand`. See `assets/README.md`. */
  assets: {
    logo: '/assets/brand/logo.png',
    logoWhite: '/assets/brand/logo-white.svg',
    logoColor: '/assets/brand/logo-color.svg',
    icon: '/assets/brand/icon.svg',
    logoMobile: '/assets/brand/logo-mobile.webp',
    /** "+18" responsible-gaming badge, painted in the brand colour. */
    ageBadge: '/assets/brand/agecap.svg',
    favicon: '/assets/brand/favicon.png',
    /** Chrome icons painted in the brand accent. See `assets/README.md`. */
    icons: {
      navHome: '/assets/brand/icons/ball-icon.svg',
      navLiveActive: '/assets/brand/icons/bet-coin.svg',
      navDepositActive: '/assets/brand/icons/deposit-icon.svg',
      liveBadge: '/assets/brand/icons/live-icon.svg',
      support: '/assets/brand/icons/chat-icon.svg',
      search: '/assets/brand/icons/search-icon.svg',
      arrowLeft: '/assets/brand/icons/arrow-left.svg',
      arrowRight: '/assets/brand/icons/arrow-right.svg',
    },
    /** Intrinsic size of `logoWhite`; `NgOptimizedImage` warns when it does not match the file. */
    logoSize: { width: 303, height: 114 },
  },

  features: {
    /** Allow launching games in demo mode without an account. */
    demoPlay: false,
    /** Route deposits/withdrawals through the payment provider's sandbox. */
    paymentTestMode: true,
    /** Backoffice menu entries promoted in the desktop sidebar (usually the loyalty club). */
    highlightedMenuLabels: [],
  },

  layout: {
    /** `brand-bar` is the plain coloured header bar; `dark` is the dark header with the toggle. */
    header: 'brand-bar',
    /** Turn on to get the desktop sidebar with the CMS blocks next to the lobby. */
    desktopSidebar: false,
  },

  i18n: {
    defaultLanguage: 'pt-BR',
    supportedLanguages: ['en-US', 'pt-BR'],
  },

  // Who holds the player accounts and supplies the games. `comtrade` for a PortalGateway brand,
  // `house` for our own backend, `demo` while there is none (development only - a production
  // build refuses it). One entry per port, so a brand can mix providers.
  gateways: {
    auth: 'demo',
    player: 'demo',
    games: 'demo',
  },
};
