import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CredentialsService } from '@app/auth';

export const publicAuthGuard: CanActivateFn = () => {
  const sessionService = inject(CredentialsService);
  const router = inject(Router);

  if (sessionService.isAuthenticated()) {
    router.createUrlTree(['/']);
    return false;
  }

  return true;
};

export const privateAuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const sessionService = inject(CredentialsService);
  const router = inject(Router);

  if (!sessionService.isAuthenticated()) {
    router.navigate(['/auth/login'], { queryParams: { redirectURL: state.url } });
    return false;
  }

  return true;
};
