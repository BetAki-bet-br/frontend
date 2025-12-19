import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TopWinner } from '../models/winner.models';
import { ProdGameService } from '../../api';
import { TopWinnersATL as ApiTopWinnersATL } from '../../api/model/models';

function toLocalTopWinner(apiWinner: ApiTopWinnersATL): TopWinner {
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
      .apiPortalV1ProdGameTopWinnersGet(1)
      .pipe(map((response: ApiTopWinnersATL[]) => response.map(toLocalTopWinner)));
  }
}
