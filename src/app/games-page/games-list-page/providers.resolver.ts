import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, map } from 'rxjs';
import { Provider } from '../models/game.models';
import { ProvidersService } from '@app/@core/backoffice/providers.service';
import { GameEnum } from '@app/@shared/enums/gameEnum';

export const providersResolver: ResolveFn<Provider[]> = (): Observable<Provider[]> => {
  const providersService = inject(ProvidersService);
  const portalService = inject(PortalService);

  return providersService
    .getProvidersForFrontend(GameEnum.CASINO, portalService.portalId)
    .pipe(map((providers) => providers || []));
};
