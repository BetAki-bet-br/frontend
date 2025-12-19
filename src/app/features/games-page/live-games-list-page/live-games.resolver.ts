import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@/app/core/services/game.service';
import { SubLevel } from '@/app/core/models/game.models';
import { Observable, filter, take } from 'rxjs';
import { PortalService } from '@/app/core/services/portal.service';

export const liveGamesResolver: ResolveFn<SubLevel[]> = (): Observable<SubLevel[]> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);

  return gameService.getLiveCasinoGames(portalService.portalId).pipe(
    filter((games) => games.length > 0),
    take(1)
  );
};
