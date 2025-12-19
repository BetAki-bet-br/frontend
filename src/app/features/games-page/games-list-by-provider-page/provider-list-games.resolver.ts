import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { SubLevel } from '@/app/core/models/game.models';
import { ProvidersService } from '@/app/core/services/providers.service';
import { PortalService } from '@/app/core/services/portal.service';
import { GameEnum } from '@/app/enums/gameEnum';

export const providerListGamesResolver: ResolveFn<SubLevel> = (route: ActivatedRouteSnapshot) => {
  const providersService = inject(ProvidersService);
  const portalService = inject(PortalService);

  const providerId = Number(route.paramMap.get('id'));
  const levelId = GameEnum.CASINO; // ID de nível para jogos de cassino (não-ao-vivo)
  const portalId = portalService.portalId;

  return providersService.getGamesByProvider(providerId, levelId, portalId);
};
