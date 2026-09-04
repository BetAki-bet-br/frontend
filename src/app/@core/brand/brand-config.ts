import { InjectionToken } from '@angular/core';
import { BRAND_CONFIG } from '@brand/brand.config';

/**
 * Everything that changes when the same application is shipped under a different brand.
 *
 * One implementation per brand lives in `brands/<slug>/brand.config.ts`; the `@brand/*` TypeScript
 * path alias (see `tsconfig.brand-<slug>.json`) decides which one is compiled into the bundle.
 * Nothing here is environment configuration: `src/environments/environment*.ts` keeps only the
 * handful of keys that describe *where* the app runs, not *who* it runs as.
 */
export interface BrandConfig {
  /** Directory name of the brand package under `brands/`. */
  slug: string;
  /** Public brand name, as shown to players. */
  name: string;
  /** Registered company name, when it differs from the public one. */
  legalName?: string;

  seo: {
    /** Document title used when the active route does not provide one. */
    title: string;
    /** Default `<meta name="description">` content. */
    description: string;
    /** Canonical origin, with trailing slash (e.g. `https://betaki.bet.br/`). */
    hostname: string;
    /** Appended to per-route titles (e.g. `Cassino - BetAki`). */
    titleSuffix: string;
  };

  ids: {
    /** CMS brand id used by the portal gateway templates API. */
    brandId: number;
    /** Brand id used by the bonus/promotions API. */
    defaultBrandId: number;
    desktopPortalId: number;
    mobilePortalId: number;
    /** Suffix appended to CMS category slugs (`home-betaki`). Empty string disables it. */
    cmsSlugPostfix: string;
  };

  api: {
    /** Backoffice (Laravel) base url, already resolved for the active environment. */
    backofficeApiUrl: string;
    /** `X-Api-Key` sent to the portal gateway. */
    apiKey: string;
    gamesThumbsBaseUrl: string;
    gamesThumbsUrlSuffix: string;
    /** CMS/CDN root holding the brand's static html and promotion assets. */
    cmsAssetsBaseUrl: string;
    /** CDN prefix prepended to local asset paths. Empty string serves assets from the app origin. */
    assetsBaseUrl: string;
    assetsPath: string;
    assetsQueryString: string;
  };

  integrations: {
    gtmId?: string;
    tawkToSDK?: string;
    fonetalk?: string;
    /** Legitimuz token, already resolved for the active environment. */
    legitimuzSDKToken?: string;
    sportsbook?: { integration: string; sdk: string };
    affiliatePixel?: string;
    /** Hours an affiliate deep link stays in local storage. */
    affiliateDataExpiryOffset: number;
  };

  /** Copy only the brand's lawyers can write. */
  legal: {
    /** Regulatory paragraph rendered at the bottom of the footer. Plain text, no markup. */
    disclaimer: string;
    /** Player-facing mailbox quoted in the privacy/data-portability copy. */
    supportEmail: string;
  };

  social: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    telegram?: string;
    facebook?: string;
  };

  /** Urls of the brand artwork, served from `brands/<slug>/assets` under `/assets/brand`. */
  assets: {
    /** Primary logo on a light surface (dialogs, maintenance page, broken-image fallback). */
    logo: string;
    /** Monochrome logo for dark surfaces (header, mobile sidebar). */
    logoWhite: string;
    /** Full-colour logo for dark surfaces (footer). */
    logoColor: string;
    /** Square mark, used where the full wordmark does not fit (mobile menu, mobile sidebar). */
    icon: string;
    /** Compact wordmark for the mobile header and game-card placeholders. */
    logoMobile: string;
    favicon: string;
    /**
     * "+18" responsible-gaming badge shown on the auth pages, the wallet screens and the
     * e-mail confirmation step. Brand-owned because it is painted in the brand colour.
     */
    ageBadge: string;
    /**
     * Chrome artwork painted in the brand's accent colour. Brand-owned for the same reason as
     * `ageBadge`: the accent is baked into the file, so a copy shared from `src/assets` would
     * ship one brand's colour to every other brand. The white/neutral variants of the same
     * icons stay in `src/assets/icons`.
     */
    icons: {
      /** Mobile bottom-nav "home" pill, and the same mark in the mobile sidebar. */
      navHome: string;
      /** Mobile bottom-nav "Ao Vivo" in its active state, and the mobile sidebar's live entry. */
      navLiveActive: string;
      /** Mobile bottom-nav "Depositar" in its active state. */
      navDepositActive: string;
      /** "Ao vivo" badge stamped on live game cards. */
      liveBadge: string;
      /** Speech bubble on the footer's "Contate-nos" button. */
      support: string;
      /** Magnifier on the casino and live search pages. */
      search: string;
      /** "Voltar" chevron on the lobby's game rows. */
      arrowLeft: string;
      /** "Ver todos" chevron on the lobby's game rows. */
      arrowRight: string;
    };
    /**
     * Intrinsic size of `logoWhite`, in pixels. `NgOptimizedImage` needs the real aspect ratio
     * of the header logo up front, and it warns when the declared ratio does not match the file.
     */
    logoSize: { width: number; height: number };
  };

  features: {
    demoPlay: boolean;
    paymentTestMode: boolean;
    /**
     * Backoffice menu entries the brand wants promoted in the desktop sidebar — typically its
     * loyalty club. The backoffice `Menu` model carries no highlight flag, so the brand names the
     * entries instead; matched against `Menu.name` exactly.
     */
    highlightedMenuLabels: string[];
  };

  /** Which shell chrome the brand ships. Structure, not colour: colour is a `@theme` token. */
  layout: {
    /**
     * `brand-bar`: full-colour header bar with text links (BetAki).
     * `dark`: dark header with a Cassino/Ao vivo toggle, inline search and CTA (GirosBet).
     */
    header: 'brand-bar' | 'dark';
    /** Desktop sidebar with CMS-driven blocks (banner, promo tiles, shortcut/popular/help menus). */
    desktopSidebar: boolean;
  };

  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}

/**
 * The brand the current bundle was built for.
 *
 * Provided in root, so `inject(BRAND)` works anywhere without touching `app.config.ts`.
 * Outside an injection context (interceptors' module scope, plain functions) import
 * `BRAND_CONFIG` from `@app/@core/brand` instead.
 */
export const BRAND = new InjectionToken<BrandConfig>('BRAND', {
  providedIn: 'root',
  factory: () => BRAND_CONFIG,
});
