import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { PlayerService } from '../services/player.service';
import { ModalService } from '../services/modal.service';
import { SessionService } from '../services/session.service';
import { PlayerStatusesResponse } from '../models/player.models';
import { map, take } from 'rxjs/operators';

export const playerStatusGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const playerService = inject(PlayerService);
  const modalService = inject(ModalService);
  const sessionService = inject(SessionService);
  const sportsbookRoutes = ['', 'sportsbook-live'];
  const isSportsBook = sportsbookRoutes.includes(route.routeConfig?.path || '');

  if (!sessionService.isAuthenticated()) {
    return true;
  }

  return playerService.getPlayerStatuses().pipe(
    take(1),
    map((statuses: PlayerStatusesResponse | null) => {
      if (!statuses) {
        modalService.open('processVerification');
        return isSportsBook;
      }

      const isVerified = statuses.kycStatus && statuses.email && statuses.address;

      if (isSportsBook) {
        if (!isVerified) {
          modalService.open('processVerification');
        }
        return true;
      }

      if (!isVerified) {
        modalService.open('processVerification');
        return false;
      }

      return true;
    })
  );
};
