import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProdGameService } from '@icore/ngx-portalgateway-api-client-atl';
import { TopWinner } from '../models/winner.models';
function toLocalTopWinner(apiWinner: TopWinnersATL): TopWinner {
  return {
    playerId: apiWinner.playerId ?? '',
    username: apiWinner.username ?? '',
    gameExternalId: apiWinner.gameExternalId ?? '',
    gameName: apiWinner.gameName ?? '',
    productName: apiWinner.productName ?? '',
    amount: apiWinner.amount ?? '',
    currencyId: apiWinner.currencyId ?? '',
    currencyCode: apiWinner.currencyCode ?? '',
    winDate: apiWinner.winDate ?? '',
    betAmount: apiWinner.betAmount ?? '',
  };
}

@Injectable({
  providedIn: 'root',
})
export class WinnersService {
  private prodGameService = inject(ProdGameService);

  getTopWinners(): Observable<TopWinner[]> {
    return this.prodGameService
      .apiPortalV1ProdGameTopWinnersGet(5)
      .pipe(map((response: TopWinnersATL[]) => response.map(toLocalTopWinner)));
  }
}

export interface TopWinnersATL {
  /**
   * Players Id
   */
  playerId?: string | null;
  /**
   * Players username
   */
  username?: string | null;
  /**
   * External Game Id
   */
  gameExternalId?: string | null;
  /**
   * Name of the game
   */
  gameName?: string | null;
  /**
   * Product Name
   */
  productName?: string | null;
  /**
   * Amount
   */
  amount?: string | null;
  /**
   * Currency Id
   */
  currencyId?: string | null;
  /**
   * Currency Code
   */
  currencyCode?: string | null;
  /**
   * Win Date
   */
  winDate?: string | null;
  /**
   * Amount
   */
  betAmount?: string | null;
}
