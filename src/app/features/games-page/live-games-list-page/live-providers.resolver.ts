import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Provider } from '@/app/core/models/game.models';
import { Observable, map, take } from 'rxjs';
import { ProvidersService } from '@/app/core/services/providers.service';
import { PortalService } from '@/app/core/services/portal.service';
import { GameEnum } from '@/app/enums/gameEnum';

export const liveProvidersResolver: ResolveFn<Provider[]> = (): Observable<Provider[]> => {
  const providerService = inject(ProvidersService);
  const portalService = inject(PortalService);

  return providerService.getProviders(GameEnum.LIVE_CASINO, portalService.portalId).pipe(
    take(1),
    map((providers) => providers || [])
  );
};
