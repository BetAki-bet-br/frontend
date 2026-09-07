/**
 * The published demo: optimised like production, but with nothing real behind it.
 *
 * `showcase` is what separates this from `environment.prod.ts`, and it does two things:
 * `brandEnv()` resolves the brand's `demo` variants (the gateways and the backoffice url), and
 * `provideGateways()` stops refusing the demo adapters. A brand build that serves actual players
 * never sets it, so the rail that keeps fake accounts out of production is still in place.
 *
 * See `docs/white-label/04-demo-deploy.md`.
 */
export const environment = {
  production: true,
  showcase: true,
  version: 1.0,
  API_BASE_PATH: '',
  API_GEOLOCATION_PATH: 'https://ipapi.co/json/',
  useLocalHtmlTemplates: false,
};
