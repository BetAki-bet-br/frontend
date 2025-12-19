import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { Provider } from '../models/game.models';
import { GameEnum } from '@app/@shared/enums/gameEnum';
import { PortalService } from '@app/@shared/services/portal.service';
import { ProvidersService } from '@app/@shared/services/providers.service';

export const liveProvidersResolver: ResolveFn<Provider[]> = (): Observable<Provider[]> => {
  const providerService = inject(ProvidersService);
  const portalService = inject(PortalService);

  return providerService.getProviders(GameEnum.LIVE_CASINO, portalService.portalId).pipe(
    take(1),
    map((providers) => providers || [])
  );
};
