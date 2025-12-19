import { Injectable } from '@angular/core';
import { GetBalanceResponse, Loyalty } from '@icore/ngx-portalgateway-api-client-atl';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockPlayerStatusService {
  updatePlayerLoyaltyStatus(): Observable<Loyalty> {
    return of();
  }

  updatePlayerBalance(): Observable<GetBalanceResponse> {
    return of();
  }

  updatePlayerData(): Observable<void> {
    return of();
  }
}
