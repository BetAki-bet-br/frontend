import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { Observable, filter, take } from 'rxjs';
import { SubLevel } from '../models/game.models';
import { PortalService } from '@app/@shared/services/portal.service';

export const liveGamesResolver: ResolveFn<SubLevel[]> = (): Observable<SubLevel[]> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);

  return gameService.getLiveCasinoGames(portalService.portalId).pipe(
    filter((games) => games.length > 0),
    take(1)
  );
};
