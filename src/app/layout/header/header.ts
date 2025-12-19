import { CurrencyPipe, NgOptimizedImage, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarService } from '../sidebar-mobile/sidebar-mobile.service';
import { SessionService } from '@/app/core/services/session.service';
import { BalanceService } from '@/app/core/services/balance.service';
import { ProfileModal } from './profile-modal/profile-modal';
import { ClickOutsideDirective } from '@/app/shared/directives/click-outside.directive';
import { FullscreenService } from '@/app/core/services/fullscreen.service';
import { RoutingService } from '@/app/core/services/routing.service';

interface RouteWithLabel {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe, ProfileModal, ClickOutsideDirective],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private location = inject(Location);
  private fullscreenService = inject(FullscreenService);
  sidebarService: SidebarService = inject(SidebarService);
  sessionService = inject(SessionService);
  balanceService = inject(BalanceService);
  routingService = inject(RoutingService);

  showProfileModal = signal(false);

  routesWithLabel: RouteWithLabel[] = [
    { path: '/', label: 'Esportes', exact: true },
    { path: '/sportsbook-live', label: 'Esportes ao vivo', exact: true },
    { path: '/games', label: 'Cassino', exact: false },
    { path: '/games/live', label: 'Cassino ao vivo', exact: false },
    {
      path: '/promotions',
      label: 'Promoções',
      exact: false,
    },
  ];

  isLoggedIn = computed(() => this.sessionService.isAuthenticated());
  amount = this.balanceService.totalBalance;
  isBalanceVisible = this.balanceService.isBalanceVisible;

  isGameMode = this.routingService.isIngame;
  isFullscrreen = this.fullscreenService.isFullscreen;

  betakiLogo = 'assets/brand/logo-white.svg';
  betakiMobileLogo = '/assets/icons/logo-white.png';

  goBack() {
    this.location.back();
  }

  toggleFullscreen() {
    this.fullscreenService.toggle();
  }

  shareGame() {
    if (!navigator.share) {
      console.log('Web Share API not supported');
    }

    navigator
      .share({
        title: document.title,
        url: window.location.href,
      })
      .catch((error) => console.error('Error sharing:', error));
  }

  toggleProfileModal(): void {
    this.showProfileModal.set(!this.showProfileModal());
  }

  closeProfileModal(): void {
    this.showProfileModal.set(false);
  }

  isLinkActive(path: string, exact: boolean): boolean {
    if (path === '/promotions') {
      return (
        this.routingService.isLinkActive('/promotions', false) ||
        this.routingService.isLinkActive('/profile/promo', false)
      );
    }
    return this.routingService.isLinkActive(path, exact);
  }
}
