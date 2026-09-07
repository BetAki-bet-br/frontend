import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BRAND } from '@app/@core/brand';
import { I18nService } from '@app/i18n';
import { Observable } from 'rxjs';
import { BonusGateway } from '../bonus.gateway';
import { BonusTemplate, PlayerBonus } from '../bonus.models';

/**
 * `BonusGateway` against our own backend.
 *
 * Thin on purpose, like the other `house-*` adapters: the wire format is the port's own vocabulary,
 * so there is nothing to translate and this file reads as the specification of what the backend has
 * to serve. Every field named in `bonus.models.ts` is a field somebody has to implement.
 *
 * The bonuses live with the player, and the copy lives with the CMS, so this adapter talks to both
 * base urls: `playerApiUrl` (falling back to `backofficeApiUrl`) for the first two routes and
 * `backofficeApiUrl` for the templates.
 *
 *   GET  /api/v1/bonuses                                    -> PlayerBonus[]
 *   POST /api/v1/bonuses/{playerBonusId}/opt-in             -> 204
 *   POST /api/v1/bonuses/opt-in                             { code } -> 204
 *   GET  /api/v1/content/bonus-templates?categories=&bonusIds=&language= -> BonusTemplate[]
 *
 * Three things the backend owns that the port deliberately does not spell out:
 *
 * - **`GET /bonuses` returns everything, live and settled.** Two screens want two slices of it and
 *   both slice in the browser; the day that list gets long is the day this grows a filter.
 * - **`awardProgress` is a number or it is absent.** Whether a bonus has a progress bar worth
 *   drawing is a decision about the award condition, and the backend has already made it. The
 *   wagering bar is a different one, and the app works that out from the two wagering fields.
 * - **`needsOptIn` says whether the player still has to accept it.** Whatever the backend models
 *   underneath (offers, multi-bonus choices), this is the flag the promotions screen reads.
 *
 * `categories` and `bonusIds` are comma-separated, and `language` is a BCP 47 tag.
 */
@Injectable()
export class HouseBonusGateway implements BonusGateway {
  private readonly http = inject(HttpClient);
  private readonly i18n = inject(I18nService);
  private readonly brand = inject(BRAND);

  private get base(): string {
    return `${this.brand.api.playerApiUrl ?? this.brand.api.backofficeApiUrl}/api/v1/bonuses`;
  }

  getPlayerBonuses(): Observable<PlayerBonus[]> {
    return this.http.get<PlayerBonus[]>(this.base);
  }

  getBonusTemplates(categories: string[], bonusIds: number[]): Observable<BonusTemplate[]> {
    const params = new HttpParams()
      .set('categories', categories.join(','))
      .set('bonusIds', bonusIds.join(','))
      .set('language', this.i18n.language);

    return this.http.get<BonusTemplate[]>(`${this.brand.api.backofficeApiUrl}/api/v1/content/bonus-templates`, {
      params,
    });
  }

  optIn(playerBonusId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${playerBonusId}/opt-in`, {});
  }

  optInWithCode(code: string): Observable<void> {
    return this.http.post<void>(`${this.base}/opt-in`, { code });
  }
}
