import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { ContentGateway } from '../content.gateway';
import { CmsBanner, CmsTemplate, Country } from '../content.models';
import { TEMPLATES } from '../dev-templates';

/** Latency, so the loading states in the screens are exercised instead of skipped. */
const LATENCY_MS = 400;

/**
 * `ContentGateway` with no backend at all.
 *
 * The templates are the real ones, copied out of the CMS into `dev-templates.ts`, so anything that
 * does get rendered looks like the product. The banners are empty: what an operator would put in
 * those slots is a marketing decision, and inventing one would be inventing an offer. A screen
 * whose banner slot comes back empty simply does not draw it, which is what the published demo
 * already does today with the portal answering 404.
 *
 * A production build refuses this adapter.
 */
@Injectable()
export class DemoContentGateway implements ContentGateway {
  getBanners(): Observable<CmsBanner[]> {
    return this.answer([] as CmsBanner[]);
  }

  getTemplates(): Observable<CmsTemplate[]> {
    return this.answer<CmsTemplate[]>(TEMPLATES);
  }

  getTermsAndConditions(): Observable<string> {
    return this.answer(
      '<p>Estes são termos de demonstração. Nenhuma conta aqui é real e nenhum dinheiro é movimentado.</p>',
    );
  }

  /** The one country a Brazilian operator takes an address in, which is the point of the demo. */
  getCountries(): Observable<Country[]> {
    return this.answer([{ code: 'BR', name: 'Brazil' }]);
  }

  private answer<T>(value: T): Observable<T> {
    return of(value).pipe(delay(LATENCY_MS));
  }
}
