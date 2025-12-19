import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { CredentialsService } from '@app/auth';
import { AccountVerificationActionEnum, AuthDialogService } from '@app/auth/auth-dialog.service';
import { map } from 'rxjs/operators';

export const playerStatusGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authDialogService = inject(AuthDialogService);
  const sessionService = inject(CredentialsService);
  const sportsbookRoutes = ['', 'sportsbook-live'];
  const isSportsBook = sportsbookRoutes.includes(route.routeConfig?.path || '');

  if (!sessionService.isAuthenticated()) {
    return true;
  }

  if (isSportsBook) {
    return true;
  }

  return authDialogService
    .initAccountVerification(AccountVerificationActionEnum.GameLaunch)
    .pipe(map((res) => !!res.canPlayGame));
};
