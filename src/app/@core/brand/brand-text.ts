import { BRAND_CONFIG } from '@brand/brand.config';

/**
 * Fills the brand placeholders of a copy template.
 *
 * Supported placeholders:
 * - `{{brand}}` — the public brand name (`BrandConfig.name`);
 * - `{{brandLegal}}` — the registered company name (`BrandConfig.legalName`), falling back to the
 *   public one when the brand does not declare a separate legal entity.
 *
 * Use it for route `data.description` and any other module-scope literal that has to name the
 * brand; inside a component prefer `inject(BRAND).name` or the `translate` pipe with
 * `{ brand: ... }` parameters.
 */
export function brandText(template: string): string {
  return template
    .replace(/\{\{\s*brandLegal\s*\}\}/g, BRAND_CONFIG.legalName ?? BRAND_CONFIG.name)
    .replace(/\{\{\s*brand\s*\}\}/g, BRAND_CONFIG.name);
}

/**
 * Builds a route title out of a page name and the brand suffix.
 *
 * `brandTitle('Cassino')` → `Cassino - Bet Aki`. A brand with an empty `seo.titleSuffix` gets the
 * bare page name back.
 */
export function brandTitle(title: string): string {
  const suffix = BRAND_CONFIG.seo.titleSuffix;
  return suffix ? `${title} - ${suffix}` : title;
}

/**
 * Interpolation parameters for the translation keys that name the brand.
 *
 * Those keys carry `{{brand}}` / `{{supportEmail}}` placeholders instead of a hard-coded name, so
 * every usage site has to pass this object as `translateParams` (directive) or as the pipe
 * argument. Bind it through a component field: `protected readonly brandParams = BRAND_PARAMS;`.
 */
export const BRAND_PARAMS: Readonly<Record<string, string>> = {
  brand: BRAND_CONFIG.name,
  brandLegal: BRAND_CONFIG.legalName ?? BRAND_CONFIG.name,
  supportEmail: BRAND_CONFIG.legal.supportEmail,
};
