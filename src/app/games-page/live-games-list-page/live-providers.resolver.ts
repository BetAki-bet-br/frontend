import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Provider } from '../models/game.models';
import { PortalService } from '@app/@shared/services/portal.service';
import { PublicGameService } from '@app/@core/public-game.service';

export const liveProvidersResolver: ResolveFn<Provider[]> = (): Observable<Provider[]> => {
  const publicGameService = inject(PublicGameService);
  const portalService = inject(PortalService);

  return publicGameService.getProviders(portalService.portalId).pipe(
    map((providers) => providers || []),
  );
};
