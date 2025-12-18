import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  DeclinePlayerBonusContextRequest,
  OptedInEnum,
  PromotionDetails,
  PromotionsOptInRequest,
  PromotionsOptOutRequest,
} from '@icore/ngx-portalgateway-api-client-atl';

@Injectable({
  providedIn: 'root',
})
export class MockBonusesService {
  constructor() {}

  getBonuses(): Observable<any> {
    return of(null);
  }

  getPlayerBonuses(): Observable<any> {
    return of(null);
  }

  bonusOptIn(request?: PromotionsOptInRequest): Observable<any> {
    return of(null);
  }

  bonusOptOut(request?: PromotionsOptOutRequest): Observable<any> {
    return of(null);
  }

  declineBonus(request?: DeclinePlayerBonusContextRequest): Observable<any> {
    return of(null);
  }
}
