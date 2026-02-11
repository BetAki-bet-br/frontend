import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { PortalService } from '@app/@shared/services/portal.service';
import { ProvidersService } from '@app/@core/backoffice/providers.service';
import { SubLevel } from '../models/game.models';
import { forkJoin, map, of } from 'rxjs';

export const multiProviderGamesResolver: ResolveFn<SubLevel> = (route: ActivatedRouteSnapshot) => {
  const providersService = inject(ProvidersService);
  const portalService = inject(PortalService);

  const providerIdsParam = route.paramMap.get('ids');
  if (!providerIdsParam) {
    // Return an empty SubLevel if no IDs are provided
    return of({
      id: 'multi-provider',
      name: 'Providers not found',
      gameMains: [],
      subLevel: [],
      gameName: null,
      levelType: 'provider',
    });
  }

  const providerIds = providerIdsParam
    .split(',')
    .map(Number)
    .filter((id) => !isNaN(id));
  const levelId = (route.data['levelId'] as number) ?? GameEnum.CASINO;
  const portalId = portalService.portalId;

  const gameRequests = providerIds.map((id) => providersService.getGamesByProviderForFrontend(id, levelId, portalId));

  return forkJoin(gameRequests).pipe(
    map((results) => {
      // Get provider names from the results and create a combined title
      const providerNames = results.map((result) => result.name).join(', ');

      // Flatten the games from all results
      const allGames = results.flatMap((subLevel) => subLevel.gameMains);

      // Remove duplicates
      const uniqueGames = [...new Map(allGames.map((game) => [game.id, game])).values()];

      // Construct the final SubLevel object
      return {
        id: providerIdsParam,
        name: providerNames,
        gameMains: uniqueGames,
        subLevel: [], // Sublevels are not combined in this context
        gameName: null,
        levelType: 'provider-multi',
      };
    }),
  );
};
