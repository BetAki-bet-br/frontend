import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map } from 'rxjs';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { SubLevel } from '../models/game.models';

export const softswissCategoryResolver: ResolveFn<SubLevel> = (): Observable<SubLevel> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);

  return gameService.getGamesByPortal(portalService.portalId).pipe(
    map((games) => ({
      id: 'softswiss',
      name: 'Softswiss Games',
      gameName: null,
      subLevel: [],
      levelType: 'category',
      gameMains: games.filter((g) => g.productSupplierName === 'Softswiss'),
    })),
  );
};
