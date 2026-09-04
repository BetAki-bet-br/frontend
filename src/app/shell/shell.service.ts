import { Injectable, signal } from '@angular/core';
import { Routes, Route, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ShellComponent } from './shell-common/shell.component';

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
}

/**
 * Shell chrome state that outlives any single component.
 *
 * Only brands with `layout.desktopSidebar` render the desktop sidebar, but the state lives here
 * (and not in the sidebar component) because the header owns the toggle button.
 */
@Injectable({ providedIn: 'root' })
export class ShellService {
  /** Whether the desktop sidebar is showing icons only. Collapsed is the first-paint default. */
  readonly desktopSidebarCollapsed = signal(true);

  toggleDesktopSidebar(): void {
    this.desktopSidebarCollapsed.update((collapsed) => !collapsed);
  }
}
