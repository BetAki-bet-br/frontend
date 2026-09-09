/**
 * Where the app runs. Everything about *who* it runs as lives in `brands/<slug>/brand.config.ts`
 * and is reached through the `BRAND` token (see `src/app/@core/brand`).
 */
export const environment = {
  production: true,
  /** See `environment.ts`. A real brand build is never a showcase. */
  showcase: false,
  /** See `environment.ts`. The house install has its own build, `environment.house.ts`. */
  house: false,
  version: 1.0,
  API_BASE_PATH: '',
  API_GEOLOCATION_PATH: 'https://ipapi.co/json/',
  useLocalHtmlTemplates: false, // Should be false for production
};
