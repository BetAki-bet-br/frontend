import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CredentialsService } from '@app/auth';

/** Signed-in players get the profile version of the promotions page instead. */
export const promotionsGuard: CanActivateFn = () => {
  const credentialsService = inject(CredentialsService);
  const router = inject(Router);

  if (credentialsService.isAuthenticated()) {
    router.navigate(['/profile/promo']);
    return false;
  }
  return true;
};
