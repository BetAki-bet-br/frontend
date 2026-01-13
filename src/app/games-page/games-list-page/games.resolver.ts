import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, filter, take } from 'rxjs';
import { GameMain } from '../models/game.models';

export const gamesResolver: ResolveFn<GameMain[]> = (): Observable<GameMain[]> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);

  return gameService.getGamesByPortal(portalService.portalId).pipe(
    filter((games) => games.length > 0),
    take(1),
  );
};
