import { Routes, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ShellComponent } from './shell-common/shell.component';
import { ShellPlayerProfileComponent } from './shell-player-profile/shell-player-profile.component';
import { GameLauncherComponent } from './game-launcher/game-launcher.component';
import { AuthenticationGuard } from '@app/auth';
import { inject } from '@angular/core';

/**
 * Provides helper methods to create routes.
 */
export class Shell {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: ShellComponent,
      children: routes,
    };
  }

  /**
   * Creates routes using the shell component for player profile and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutesPlayerProfile(routes: Routes): Route {
    return {
      path: '',
      component: ShellPlayerProfileComponent,
      children: routes,
    };
  }

  /**
   * Creates routes using the shell component for player profile and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutesGameLauncher(routes: Routes): Route {
    return {
      path: '',
      component: GameLauncherComponent,
      children: routes,
      // TODO: Add the AuthenticationGuard back when login is implemented
      // canActivate: [AuthenticationGuard],
    };
  }
}
