import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { PortalService } from '@app/@shared/services/portal.service';
import { ProvidersService } from '@app/@core/backoffice/providers.service';
import { Provider } from '../models/game.models';

export const allProvidersResolver: ResolveFn<Provider[]> = (route: ActivatedRouteSnapshot) => {
  const providersService = inject(ProvidersService);
  const portalService = inject(PortalService);

  const levelId = (route.data['levelId'] as number) ?? GameEnum.CASINO;
  const portalId = portalService.portalId;

  return providersService.getProvidersForFrontend(levelId, portalId);
};