/**
 * The house's own install: the whole brand against the house backend, served on one origin by an
 * nginx that splits `/backoffice`, `/gateway`, `/play` and `/admin` between the CMS and the
 * backend.
 *
 * Optimised like production, and what separates it from `environment.prod.ts` is the `house`
 * flag: `brandEnv()` resolves the brand's `house` variants, and those are what point the seven
 * ports at `house` instead of `comtrade`. A brand's `prod` is left alone, because `prod` is what
 * describes the vendor's real install.
 *
 * See `deploy/subiu/README.md` in the backend-gateway repo.
 */
export const environment = {
  production: true,
  /** Never. A house install has a real backend behind it. */
  showcase: false,
  /** See the header: this is what makes `brandEnv()` pick the `house` variant. */
  house: true,
  version: 1.0,
  API_BASE_PATH: '',
  API_GEOLOCATION_PATH: 'https://ipapi.co/json/',
  useLocalHtmlTemplates: false,
};
