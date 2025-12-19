import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { Logger } from '@app/@shared/logger.service';
import { CredentialsService } from './credentials.service';
import { AuthDialogService } from './auth-dialog.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

const log = new Logger('AuthenticationGuard');

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard {
  /** List of routes that must have authentication. */
  authRoutes: string[] = ['/profile'];

  constructor(
    private credentialsService: CredentialsService,
    private authDialog: AuthDialogService,
    private router: Router
  ) {}

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
