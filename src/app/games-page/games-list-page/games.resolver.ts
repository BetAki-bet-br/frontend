import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, filter, take } from 'rxjs';
import { SubLevel } from '../models/game.models';

export const gamesResolver: ResolveFn<SubLevel[]> = (): Observable<SubLevel[]> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);

  return gameService.getCasinoGames(portalService.portalId).pipe(
    filter((games) => games.length > 0), // Wait until games are loaded
    take(1) // Take the first emission with data and complete
  );
};
