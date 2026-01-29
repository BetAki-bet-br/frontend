import { Injectable, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { SidebarService } from './sidebar-mobile.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class RoutingService {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly sidebarService = inject(SidebarService);
  private readonly chatService = inject(ChatService);
  isNavigating = computed(() => !!this.router.currentNavigation());
  isInCassino = signal(false);
  isLiveCasino = signal(false);
  isSportsbook = signal(false);
  isIngame = signal(false);
  isProfile = signal(false);
  isPromotions = signal(false);
  isSearch = signal(false);

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const sportsbookRoutes = ['/', '/sportsbook-live'];
        this.isSportsbook.set(sportsbookRoutes.includes(event.urlAfterRedirects));
        this.isInCassino.set(event.urlAfterRedirects.startsWith('/games') && !event.urlAfterRedirects.startsWith('/games/live'));
        this.isLiveCasino.set(event.urlAfterRedirects.startsWith('/games/live'));
        this.isIngame.set(event.urlAfterRedirects.startsWith('/game/'));
        this.isProfile.set(event.urlAfterRedirects.startsWith('/profile'));
        this.isPromotions.set(event.urlAfterRedirects.startsWith('/promotions'));
        // url is /game/search
        this.isSearch.set(event.urlAfterRedirects.includes('/search'));
        this.sidebarService.close();
        this.viewportScroller.scrollToPosition([0, 0], {
          behavior: 'smooth',
        });
        this.chatService.setCanShow(!this.isIngame());

        if (!this.isIngame() && !this.isSportsbook()) {
          this.chatService.showChat();
        } else {
          this.chatService.hideChat();
        }
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
      return this.router.isActive('/games', subsetOptions) && !this.router.isActive('/games/live', subsetOptions);
    }

    const options = {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    } as const;

    return this.router.isActive(path, options);
  }

  navigateToMenuItem(item: { routerLink?: string; categoryId?: string | number }): void {
    let path = item.routerLink;

    if (item.categoryId === 'providers') {
      if (this.router.url.startsWith('/games/live')) {
        path = '/games/live/category/providers';
      } else {
        path = '/games/category/providers';
      }
    }

    if (path) {
      this.router.navigateByUrl(path);
    }
  }
}
