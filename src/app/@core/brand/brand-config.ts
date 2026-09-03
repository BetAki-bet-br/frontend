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

  social: {
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    telegram?: string;
    facebook?: string;
  };

  /** Urls of the brand artwork, served from `brands/<slug>/assets` under `/assets/brand`. */
  assets: {
    logo: string;
    logoWhite: string;
    logoColor: string;
    icon: string;
    favicon: string;
  };

  features: {
    demoPlay: boolean;
    paymentTestMode: boolean;
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
