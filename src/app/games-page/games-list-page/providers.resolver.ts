import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PortalService } from '@app/@shared/services/portal.service';
import { Observable, map } from 'rxjs';
import { Provider } from '../models/game.models';
import { PublicGameService } from '@app/@core/public-game.service';

export const providersResolver: ResolveFn<Provider[]> = (): Observable<Provider[]> => {
  const publicGameService = inject(PublicGameService);
  const portalService = inject(PortalService);

  return publicGameService.getProviders(portalService.portalId).pipe(
    map((providers) => providers || []),
  );
};
