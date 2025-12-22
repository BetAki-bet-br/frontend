import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { GameService } from '@app/@shared/services/game.service';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, map, forkJoin, of } from 'rxjs';
import { CredentialsService } from '@app/auth';
import { SubLevel, GameMain } from '../models/game.models';

export const liveRecentGamesResolver: ResolveFn<SubLevel | undefined> = (): Observable<SubLevel | undefined> => {
  const gameService = inject(GameService);
  const portalService = inject(PortalService);
  const sessionService = inject(CredentialsService);

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
      const recentGames = recentIds.map((id) => recentGamesMap.get(id!)).filter((g): g is GameMain => !!g);

      return {
        id: 'recent',
        name: 'Jogados Recentemente',
        gameMains: recentGames as GameMain[],
        subLevel: [],
        gameName: null,
        levelType: 'Category',
        parentId: undefined,
      } satisfies SubLevel;
    }),
  );
};
