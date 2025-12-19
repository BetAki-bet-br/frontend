import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameService } from '@/app/core/services/game.service';
import { GameMain, SubLevel } from '@/app/core/models/game.models';
import { Observable, map, forkJoin, of } from 'rxjs';
import { PortalService } from '@/app/core/services/portal.service';
import { SessionService } from '@/app/core/services/session.service';

import { GameEnum } from '@/app/enums/gameEnum';

export const liveRecentGamesResolver: ResolveFn<SubLevel | undefined> = (): Observable<
  SubLevel | undefined
> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);
  const sessionService = inject(SessionService);

  if (!sessionService.isAuthenticated()) {
    return of(undefined);
  }

  const recentGamesIds$ = gameService
    .getRecentGames(50, portalService.portalId)
    .pipe(map((games) => games.map((g) => g.gameExternalId)));

  const allGames$ = gameService
    .getGamesByPortal(portalService.portalId)
    .pipe(map((games) => games.filter((g) => g.productId === GameEnum.LIVE_CASINO)));

  return forkJoin([recentGamesIds$, allGames$]).pipe(
    map(([recentIds, allGames]) => {
      const recentGamesMap = new Map(allGames.map((game) => [game.externalId, game]));
      const recentGames = recentIds
        .map((id) => recentGamesMap.get(id!))
        .filter((g): g is GameMain => !!g);

      return {
        id: 'recent',
        name: 'Jogados Recentemente',
        gameMains: recentGames,
        subLevel: [],
        gameName: null,
        levelType: 'Category',
        parentId: undefined,
      };
    })
  );
};
