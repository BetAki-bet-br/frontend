import { CurrencyPipe, NgOptimizedImage, Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CredentialsService } from '@app/auth';
import { PlayerStatusService } from '@app/@shared/services/player.status.service';
import { DataStoreService } from '@app/@core';
import { ProfileModal } from './profile-modal/profile-modal';
import { ClickOutsideDirective } from '@app/@shared/directives/click-outside.directive';
import { RoutingService } from '@app/@shared/services/routing.service';
import { FullscreenService } from '@app/@shared/services/fullscreen.service';
import { TranslateModule } from '@ngx-translate/core';
import { BRAND } from '@app/@core/brand';

interface RouteWithLabel {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgOptimizedImage, CurrencyPipe, ProfileModal, ClickOutsideDirective, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private location = inject(Location);
  private fullscreenService = inject(FullscreenService);
  private credentialsService = inject(CredentialsService);
  private playerService = inject(PlayerStatusService);
  private dataStoreService = inject(DataStoreService);
  routingService = inject(RoutingService);

  showProfileModal = signal(false);

  routesWithLabel: RouteWithLabel[] = [
    { path: '/games', label: 'Casino', exact: false },
    { path: '/games', label: 'Casino live', exact: false },
    { path: '/games', label: 'Promotions', exact: false },
  ];

  isLoggedIn = toSignal(this.credentialsService.isAuthenticated$, { initialValue: false });
  private balance = toSignal(this.playerService.balanceSub$);
  amount = computed(() => this.balance()?.totalBalance ?? 0);

  isBalanceVisible = toSignal(this.dataStoreService.balanceVisibilityChange, {
    initialValue: this.dataStoreService.balanceVisible,
  });

  isGameMode = this.routingService.isIngame;
  isFullscrreen = this.fullscreenService.isFullscreen;

  private readonly brand = inject(BRAND);
  brandLogo = this.brand.assets.logoWhite;
  brandMobileLogo = this.brand.assets.logoMobile;
  brandLogoSize = this.brand.assets.logoSize;

  goBack() {
    this.location.back();
  }

  toggleFullscreen() {
    this.fullscreenService.toggle();
  }

  navigateBack(): void {
    window.history.back();
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
    return this.routingService.isLinkActive(path, exact);
  }
}
