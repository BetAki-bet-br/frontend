import { Injectable, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoadingService } from '@shared/loading/loading.service';
import { ViewportScroller } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly viewportScroller = inject(ViewportScroller);
  isNavigating = computed(() => !!this.router.currentNavigation());
  isInCassino = signal(false);
  isSportsbook = signal(false);
  isIngame = signal(false);
  isProfile = signal(false);
  isPromotions = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const sportsbookRoutes = ['/', '/sportsbook-live'];
        this.isSportsbook.set(sportsbookRoutes.includes(event.urlAfterRedirects));
        this.isInCassino.set(event.urlAfterRedirects.startsWith('/games'));
        this.isIngame.set(event.urlAfterRedirects.startsWith('/game/'));
        this.isProfile.set(event.urlAfterRedirects.startsWith('/profile'));
        this.isPromotions.set(event.urlAfterRedirects.startsWith('/promotions'));
        this.viewportScroller.scrollToPosition([0, 0], {
          behavior: 'smooth',
        });
      }
    });
  }

  isLinkActive(path: string, exact: boolean): boolean {
    const subsetOptions = {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    } as const;

    if (path === '/games') {
      return (
        this.router.isActive('/games', subsetOptions) &&
        !this.router.isActive('/games/live', subsetOptions)
      );
    }

    const options = {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    } as const;

    return this.router.isActive(path, options);
  }
}
