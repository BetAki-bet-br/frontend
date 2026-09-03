/**
 * Where the app runs. Everything about *who* it runs as lives in `brands/<slug>/brand.config.ts`
 * and is reached through the `BRAND` token (see `src/app/@core/brand`).
 */
export const environment = {
  production: true,
  version: 1.0,
  API_BASE_PATH: '',
  API_GEOLOCATION_PATH: 'https://ipapi.co/json/',
  useLocalHtmlTemplates: false, // Should be false for production
};
