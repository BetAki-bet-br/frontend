import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from './credentials.service';
import { AuthDialogService } from './auth-dialog.service';

const log = new Logger('AuthenticationGuard');

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  private credentialsService = inject(CredentialsService);
  private authDialog = inject(AuthDialogService);
  private router = inject(Router);

  /** List of routes that must have authentication. */
  authRoutes: string[] = ['/profile'];

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.credentialsService.isAuthenticated()) {
      return true;
    }

    log.debug('Not authenticated, showing register popup, with redirect URL ', state.url);

    this.router.navigate(['register']);

    // Redirect to home on direct URL access
    if (window.history.state === null) {
      this.router.navigate(['/']);
      log.debug('Not authenticated, redirecting...');
    }

    return false;
  }

  /**
   * Checks if the provided url is in the list for authenticated routes.
   * @param url Full url that will be checked
   */
  isAuthUrl(url: string): boolean {
    for (const authRoute of this.authRoutes) {
      if (url.startsWith(authRoute)) return true;
    }

    return false;
  }
}
