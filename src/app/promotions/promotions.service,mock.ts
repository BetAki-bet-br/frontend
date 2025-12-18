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
export class MockPromotionsService {
  constructor() {}

  getPromotions(status: OptedInEnum): Observable<PromotionDetails[]> {
    return of([]);
  }

  getPromotionsBanner(): Observable<any> {
    return of(null);
  }
}
