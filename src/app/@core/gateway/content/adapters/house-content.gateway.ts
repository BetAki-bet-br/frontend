import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { I18nService } from '@app/i18n';
import { Observable, map } from 'rxjs';
import { ContentGateway } from '../content.gateway';
import { CmsBanner, CmsTemplate, Country } from '../content.models';

/**
 * `ContentGateway` against our own backend.
 *
 * Thin on purpose, like the other `house-*` adapters: the wire format is the port's own vocabulary,
 * so there is nothing to translate and this file reads as the specification of what the backend has
 * to serve. Every field named in `content.models.ts` is a field somebody has to implement.
 *
 * This is the one port whose house implementation already half exists: the backoffice is our CMS,
 * and it is already where the lobby's rows and artwork come from. What is missing is these four
 * routes over the same content.
 *
 * Base url: `BrandConfig.api.backofficeApiUrl`, because this is the CMS and not the player API.
 *
 *   GET /api/v1/content/banners?slugs=&language=  -> CmsBanner[]
 *   GET /api/v1/content/templates                 -> CmsTemplate[]
 *   GET /api/v1/content/terms?language=           -> { html }
 *   GET /api/v1/content/countries                 -> Country[]
 *
 * Three things the backend owns that the port deliberately does not spell out:
 *
 * - **A banner arrives flattened.** `content` is a plain map of field name to value, with image
 *   fields already resolved to urls and checkboxes to booleans. Whatever shape the CMS stores is
 *   its business.
 * - **`GET /banners` decides for itself whether to personalise.** The session says who is asking;
 *   a backend with nothing per-player to add just returns the same banners to everybody.
 * - **Which brand is asking comes from the credentials**, not the query string. One deployment
 *   serves one brand.
 *
 * `slugs` is comma-separated, and `language` is a BCP 47 tag.
 */
@Injectable()
export class HouseContentGateway implements ContentGateway {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.backofficeApiUrl}/api/v1/content`;
  }

  getBanners(slugs: string[]): Observable<CmsBanner[]> {
    const params = new HttpParams().set('slugs', slugs.join(',')).set('language', this.i18n.language);

    return this.http.get<CmsBanner[]>(`${this.base}/banners`, { params });
  }

  getTemplates(): Observable<CmsTemplate[]> {
    return this.http.get<CmsTemplate[]>(`${this.base}/templates`);
  }

  getTermsAndConditions(): Observable<string> {
    return this.http
      .get<{ html: string }>(`${this.base}/terms`, { params: new HttpParams().set('language', this.i18n.language) })
      .pipe(map((response) => response.html));
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.base}/countries`);
  }
}
