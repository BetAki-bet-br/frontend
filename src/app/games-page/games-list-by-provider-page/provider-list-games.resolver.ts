import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { PortalService } from '@app/@shared/services/portal.service';
import { ProvidersService } from '@app/@shared/services/providers.service';
import { SubLevel } from '../models/game.models';

export const providerListGamesResolver: ResolveFn<SubLevel> = (route: ActivatedRouteSnapshot) => {
  const providersService = inject(ProvidersService);
  const portalService = inject(PortalService);

  const providerId = Number(route.paramMap.get('id'));
  const levelId = GameEnum.CASINO; // ID de nível para jogos de cassino (não-ao-vivo)
  const portalId = portalService.portalId;

  return providersService.getGamesByProvider(providerId, levelId, portalId);
};
