import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CmsBanner, CmsTemplate, Country } from './content.models';

/**
 * Everything the application asks of whoever holds the portal's content.
 *
 * Same rules as the other ports:
 *
 * - Only the types in `content.models.ts` cross this boundary. No vendor DTO, no field-value bags.
 * - The provider's configuration is the adapter's problem: the portal id, the language the content
 *   is asked for in, and whether there is a signed-in player to personalise it for.
 * - Caching belongs to the caller. `CmsService` and `TemplateService` keep what they fetched in
 *   `DataStoreService`; a gateway answers the call it was given.
 *
 * The slugs, on the other hand, **are** the app's: which slot a screen is asking about is written
 * in `CategoryKeyEnum` and translated per brand by `CmsSlugService`, so they cross as parameters.
 */
export interface ContentGateway {
  /**
   * The banners in the given slots.
   *
   * Ordering is the caller's business; a gateway may answer in any order. Whether the banners are
   * personalised for the signed-in player is the gateway's, and the adapter decides how to ask.
   */
  getBanners(slugs: string[]): Observable<CmsBanner[]>;

  /**
   * Every template the brand's banners can be rendered with.
   *
   * Asked for once and cached by the caller, because every banner needs the same list.
   */
  getTemplates(): Observable<CmsTemplate[]>;

  /** The current terms and conditions, as HTML, in the player's language. */
  getTermsAndConditions(): Observable<string>;

  /**
   * The countries the operator accepts an address in, for the dropdowns on the profile forms.
   *
   * Whatever placeholder rows a provider keeps in its own list are already gone.
   */
  getCountries(): Observable<Country[]>;
}

/**
 * The content gateway the running brand was built with.
 *
 * Provided by `provideGateways()` in `src/app.config.ts`, which reads the brand's choice from
 * `BrandConfig.gateways`. Nothing else in the app should know which adapter answered.
 */
export const CONTENT_GATEWAY = new InjectionToken<ContentGateway>('CONTENT_GATEWAY');
