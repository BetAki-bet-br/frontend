import { CurrencyPipe, NgOptimizedImage, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
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
import { HeaderDark } from './header-dark/header-dark';
import { HeaderFloating } from './header-floating/header-floating';

interface RouteWithLabel {
  path: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgOptimizedImage,
    CurrencyPipe,
    ProfileModal,
    ClickOutsideDirective,
    TranslateModule,
    HeaderDark,
    HeaderFloating,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** Which non-game nav the brand ships. Structure only: the colours come from the theme tokens. */
  readonly headerLayout = this.brand.layout.header;

  /**
   * Classes of the bar itself. `brand-bar` and `dark` share the geometry and
   * `--color-surface-header`, and only `dark` trades the translucent blur for a hairline bottom
   * border. `floating` paints nothing at all: its own rounded bar carries the fill, so the page and
   * the glow behind it read through the gutters around it, and the empty bar stops swallowing the
   * clicks that belong to whatever scrolled underneath. Game mode is the same nav for every layout,
   * so there the filled bar comes back.
   */
  readonly headerClasses = computed(() => {
    const base =
      'fixed header-wrapper h-(--header-height-mobile) md:h-(--header-height-desktop) w-full flex justify-center z-40';
    const filled = `${base} bg-surface-header`;

    if (this.isGameMode()) {
      return `${filled} backdrop-blur-3xl bg-opacity-90`;
    }

    switch (this.headerLayout) {
      case 'dark':
        return `${filled} border-b border-white/10`;
      case 'floating':
        return `${base} pointer-events-none`;
      default:
        return `${filled} backdrop-blur-3xl bg-opacity-90`;
    }
  });

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
